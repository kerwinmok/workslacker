import com.sun.net.httpserver.Headers;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

// simple java server i wrote to test how a backend connects to my frontend
public class DealershipBackendServer {

  // list of advisors in memory (acting like a small database)
  private static final List<AdvisorRecord> advisorDatabase = new ArrayList<>();

  public static void main(String[] args) throws IOException {
    // add some starter advisors
    advisorDatabase.add(new AdvisorRecord("Alex", "alex@thebmwstore.ca"));
    advisorDatabase.add(new AdvisorRecord("Jordan", "jordan@thebmwstore.ca"));
    advisorDatabase.add(new AdvisorRecord("Chris", "chris@thebmwstore.ca"));

    int port = 8080;
    HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);

    // route 1: serve my html, css, and js files
    server.createContext("/", new StaticFileHandler());

    // route 2: json endpoint to get or save advisors
    server.createContext("/api/advisors", new AdvisorsApiHandler());

    // route 3: json endpoint to build the quote email on the server side
    server.createContext("/api/generate-email", new EmailGeneratorApiHandler());

    server.setExecutor(null);
    System.out.println("bmw service coordinator server running at http://localhost:" + port);
    server.start();
  }

  // basic object to hold an advisor's name and email
  static class AdvisorRecord {
    String name;
    String email;

    AdvisorRecord(String name, String email) {
      this.name = name;
      this.email = email;
    }
  }

  // sends index.html, style.css, and app.js to my browser when i open localhost:8080
  static class StaticFileHandler implements HttpHandler {
    @Override
    public void handle(HttpExchange exchange) throws IOException {
      String requestPath = exchange.getRequestURI().getPath();
      if (requestPath.equals("/")) {
        requestPath = "/index.html";
      }

      Path filePath = Paths.get(".", requestPath).normalize();
      if (!Files.exists(filePath) || Files.isDirectory(filePath)) {
        byte[] notFound = "404 not found".getBytes(StandardCharsets.UTF_8);
        exchange.sendResponseHeaders(404, notFound.length);
        try (OutputStream os = exchange.getResponseBody()) {
          os.write(notFound);
        }
        return;
      }

      String contentType = "text/plain; charset=utf-8";
      if (requestPath.endsWith(".html")) {
        contentType = "text/html; charset=utf-8";
      } else if (requestPath.endsWith(".css")) {
        contentType = "text/css; charset=utf-8";
      } else if (requestPath.endsWith(".js")) {
        contentType = "application/javascript; charset=utf-8";
      }

      byte[] fileBytes = Files.readAllBytes(filePath);
      exchange.getResponseHeaders().set("Content-Type", contentType);
      exchange.sendResponseHeaders(200, fileBytes.length);
      try (OutputStream os = exchange.getResponseBody()) {
        os.write(fileBytes);
      }
    }
  }

  // handles get and post requests for /api/advisors
  static class AdvisorsApiHandler implements HttpHandler {
    @Override
    public void handle(HttpExchange exchange) throws IOException {
      addCorsHeaders(exchange.getResponseHeaders());
      String method = exchange.getRequestMethod();

      if (method.equalsIgnoreCase("OPTIONS")) {
        exchange.sendResponseHeaders(204, -1);
        return;
      }

      if (method.equalsIgnoreCase("GET")) {
        StringBuilder jsonBuilder = new StringBuilder();
        jsonBuilder.append("[");
        for (int i = 0; i < advisorDatabase.size(); i++) {
          AdvisorRecord rec = advisorDatabase.get(i);
          jsonBuilder.append("{\"name\":\"")
              .append(escapeJson(rec.name))
              .append("\",\"email\":\"")
              .append(escapeJson(rec.email))
              .append("\"}");
          if (i < advisorDatabase.size() - 1) {
            jsonBuilder.append(",");
          }
        }
        jsonBuilder.append("]");
        sendJsonResponse(exchange, 200, jsonBuilder.toString());
        return;
      }

      if (method.equalsIgnoreCase("POST")) {
        String requestBody = readRequestBody(exchange.getRequestBody());
        String name = extractJsonField(requestBody, "name");
        String email = extractJsonField(requestBody, "email");
        if (!name.isEmpty() && !email.isEmpty()) {
          advisorDatabase.add(new AdvisorRecord(name, email));
        }
        sendJsonResponse(exchange, 201, "{\"status\":\"saved\"}");
        return;
      }

      sendJsonResponse(exchange, 405, "{\"error\":\"method not allowed\"}");
    }
  }

  // takes customer info from a post request and sends back the formatted email json
  static class EmailGeneratorApiHandler implements HttpHandler {
    @Override
    public void handle(HttpExchange exchange) throws IOException {
      addCorsHeaders(exchange.getResponseHeaders());
      String method = exchange.getRequestMethod();

      if (method.equalsIgnoreCase("OPTIONS")) {
        exchange.sendResponseHeaders(204, -1);
        return;
      }

      if (!method.equalsIgnoreCase("POST")) {
        sendJsonResponse(exchange, 405, "{\"error\":\"use post\"}");
        return;
      }

      String body = readRequestBody(exchange.getRequestBody());
      String advisorName = extractJsonField(body, "advisorName");
      String customerName = extractJsonField(body, "customerName");
      String phone = extractJsonField(body, "phone");
      String customerNumber = extractJsonField(body, "customerNumber");
      String vin = extractJsonField(body, "vin");
      String service = extractJsonField(body, "service");

      String subject = "Price Quote: " + customerName;
      String emailBody = "Hello " + advisorName + ",\n\n"
          + "Could you please give a price quote for " + service + "?\n\n"
          + "Customer Name: " + customerName + "\n"
          + "Phone Number: " + phone + "\n"
          + "Customer Number: " + customerNumber + "\n"
          + "VIN (Last 7 / Full): " + vin + "\n\n"
          + "Thank you,\nKerwin";

      String responseJson = "{\"subject\":\"" + escapeJson(subject)
          + "\",\"body\":\"" + escapeJson(emailBody) + "\"}";
      sendJsonResponse(exchange, 200, responseJson);
    }
  }

  // allow browser requests from localhost
  private static void addCorsHeaders(Headers headers) {
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Content-Type");
  }

  // read the incoming request body as a string
  private static String readRequestBody(InputStream stream) throws IOException {
    byte[] bytes = stream.readAllBytes();
    return new String(bytes, StandardCharsets.UTF_8);
  }

  // send a json string back to the client
  private static void sendJsonResponse(HttpExchange exchange, int status, String json) throws IOException {
    byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
    exchange.getResponseHeaders().set("Content-Type", "application/json; charset=utf-8");
    exchange.sendResponseHeaders(status, bytes.length);
    try (OutputStream os = exchange.getResponseBody()) {
      os.write(bytes);
    }
  }

  // grab a value out of a simple json string without needing external libraries
  private static String extractJsonField(String json, String key) {
    String pattern = "\"" + key + "\"";
    int keyIdx = json.indexOf(pattern);
    if (keyIdx == -1) {
      return "";
    }
    int colonIdx = json.indexOf(":", keyIdx);
    if (colonIdx == -1) {
      return "";
    }
    int firstQuote = json.indexOf("\"", colonIdx + 1);
    if (firstQuote == -1) {
      return "";
    }
    int secondQuote = json.indexOf("\"", firstQuote + 1);
    if (secondQuote == -1) {
      return "";
    }
    return json.substring(firstQuote + 1, secondQuote);
  }

  // escape quotes and newlines so the json stays valid
  private static String escapeJson(String input) {
    if (input == null) {
      return "";
    }
    return input
        .replace("\\", "\\\\")
        .replace("\"", "\\\"")
        .replace("\n", "\\n")
        .replace("\r", "");
  }
}
