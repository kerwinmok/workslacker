// portable usb config loaded directly when double-clicking index.html over file://
window.USB_SAVED_CONFIG = {
    "advisors":  [
                     {
                         "name":  "David Kung",
                         "email":  ""
                     },
                     {
                         "name":  "Ken Chao",
                         "email":  ""
                     },
                     {
                         "name":  "Philip Chen",
                         "email":  ""
                     },
                     {
                         "name":  "Kreig Barker",
                         "email":  ""
                     },
                     {
                         "name":  "Jack Pagtalunan",
                         "email":  ""
                     },
                     {
                         "name":  "Quentin Pink",
                         "email":  ""
                     },
                     {
                         "name":  "Jason Mah",
                         "email":  ""
                     },
                     {
                         "name":  "Jason Tabo",
                         "email":  ""
                     },
                     {
                         "name":  "Martyn Marsh",
                         "email":  ""
                     },
                     {
                         "name":  "Andrew McKinnon",
                         "email":  ""
                     }
                 ],
    "ccList":  [
                   {
                       "name":  "Service Dispatch",
                       "email":  "dispatch@thebmwstore.ca"
                   },
                   {
                       "name":  "BDC / Appointments",
                       "email":  "appointments@thebmwstore.ca"
                   }
               ],
    "signature":  "",
    "services":  [
                     {
                         "name":  "Oil Service",
                         "category":  "Oil Change"
                     },
                     {
                         "name":  "Brake Fluid Flush",
                         "category":  "Maintenance"
                     },
                     {
                         "name":  "Cabin Microfilter",
                         "category":  "Maintenance"
                     },
                     {
                         "name":  "Engine Air Filter",
                         "category":  "Maintenance"
                     },
                     {
                         "name":  "Vehicle Check Inspection",
                         "category":  "Maintenance"
                     },
                     {
                         "name":  "Front Brakes (Pads \u0026 Rotors)",
                         "category":  "Brakes"
                     },
                     {
                         "name":  "Rear Brakes (Pads \u0026 Rotors)",
                         "category":  "Brakes"
                     },
                     {
                         "name":  "Four-Wheel Alignment",
                         "category":  "Maintenance"
                     },
                     {
                         "name":  "Seasonal Tire Swap",
                         "category":  "Tires"
                     },
                     {
                         "name":  "Spark Plugs Replacement",
                         "category":  "Maintenance"
                     },
                     {
                         "name":  "Coolant Flush",
                         "category":  "Maintenance"
                     },
                     {
                         "name":  "12V Battery Replacement",
                         "category":  "Electrical"
                     },
                     {
                         "name":  "Warning Light / Diagnostics",
                         "category":  "Diagnostics"
                     }
                 ],
    "categories":  [
                       "Price Quote",
                       "Oil Change",
                       "Status Update",
                       "Callback",
                       "Maintenance",
                       "Brakes",
                       "Tires",
                       "Diagnostics",
                       "Electrical",
                       "Customer Concern",
                       "Other"
                   ],
    "templates":  [
                      {
                          "id":  "quote-standard",
                          "mode":  "quote",
                          "name":  "Standard Quote",
                          "subject":  "PRICE QUOTE: {{customerAndNumber}}",
                          "body":  "Hello {{advisorName}},\n\nCould you please provide a price quote for the request below?\n\nCustomer Name: {{customerName}}\n{{customerNumberLine}}\nPhone Number: {{customerPhone}}\nVIN: {{vin}}\nCustomer Concerns: {{serviceDetails}}\n\n{{signature}}"
                      },
                      {
                          "id":  "quote-maintenance",
                          "mode":  "quote",
                          "name":  "Oil / Maintenance",
                          "subject":  "PRICE QUOTE: {{customerAndNumber}}",
                          "body":  "Hello {{advisorName}},\n\nCould you please provide a price quote and availability for the maintenance service below?\n\nCustomer Name: {{customerName}}\n{{customerNumberLine}}\nPhone Number: {{customerPhone}}\nVIN: {{vin}}\nCustomer Concerns: {{serviceDetails}}\n\n{{signature}}"
                      },
                      {
                          "id":  "quote-brakes-tires",
                          "mode":  "quote",
                          "name":  "Brakes / Tires",
                          "subject":  "PRICE QUOTE: {{customerAndNumber}}",
                          "body":  "Hello {{advisorName}},\n\nCould you please provide a parts and labor quote for the brake/tire request below?\n\nCustomer Name: {{customerName}}\n{{customerNumberLine}}\nPhone Number: {{customerPhone}}\nVIN: {{vin}}\nCustomer Concerns: {{serviceDetails}}\n\n{{signature}}"
                      },
                      {
                          "id":  "status-general",
                          "mode":  "status",
                          "name":  "General Status",
                          "subject":  "STATUS UPDATE: {{customerAndNumber}}",
                          "body":  "Hello {{advisorName}},\n\nCould you please provide a status update for the customer below?\n\nCustomer Name: {{customerName}}\n{{customerNumberLine}}\nPhone Number: {{customerPhone}}\nVIN: {{vin}}\nCustomer Concerns: {{serviceDetails}}\n\n{{signature}}"
                      },
                      {
                          "id":  "status-ready",
                          "mode":  "status",
                          "name":  "Ready for Pickup?",
                          "subject":  "STATUS UPDATE: {{customerAndNumber}}",
                          "body":  "Hello {{advisorName}},\n\nThe customer below called to check if their vehicle is ready for pickup. Could you please provide an update?\n\nCustomer Name: {{customerName}}\n{{customerNumberLine}}\nPhone Number: {{customerPhone}}\nVIN: {{vin}}\nCustomer Concerns: {{serviceDetails}}\n\n{{signature}}"
                      },
                      {
                          "id":  "status-eta",
                          "mode":  "status",
                          "name":  "Parts / Repair ETA",
                          "subject":  "STATUS UPDATE: {{customerAndNumber}}",
                          "body":  "Hello {{advisorName}},\n\nThe customer below is asking for an updated ETA on parts/repairs. Could you please advise?\n\nCustomer Name: {{customerName}}\n{{customerNumberLine}}\nPhone Number: {{customerPhone}}\nVIN: {{vin}}\nCustomer Concerns: {{serviceDetails}}\n\n{{signature}}"
                      },
                      {
                          "id":  "callback-standard",
                          "mode":  "callback",
                          "name":  "Standard Callback",
                          "subject":  "CALLBACK: {{customerAndNumber}}",
                          "body":  "Hello {{advisorName}},\n\nCould you please give the customer below a call back?\n\nCustomer Name: {{customerName}}\n{{customerNumberLine}}\nPhone Number: {{customerPhone}}\nVIN: {{vin}}\nCustomer Concerns: {{serviceDetails}}\n\n{{signature}}"
                      },
                      {
                          "id":  "callback-urgent",
                          "mode":  "callback",
                          "name":  "Urgent Callback",
                          "subject":  "CALLBACK: {{customerAndNumber}}",
                          "body":  "Hello {{advisorName}},\n\nThe customer below requested a callback as soon as possible regarding the issue below.\n\nCustomer Name: {{customerName}}\n{{customerNumberLine}}\nPhone Number: {{customerPhone}}\nVIN: {{vin}}\nCustomer Concerns: {{serviceDetails}}\n\n{{signature}}"
                      },
                      {
                          "id":  "callback-booking",
                          "mode":  "callback",
                          "name":  "Follow-Up / Booking",
                          "subject":  "CALLBACK: {{customerAndNumber}}",
                          "body":  "Hello {{advisorName}},\n\nCould you please call the customer below back to follow up or schedule their appointment?\n\nCustomer Name: {{customerName}}\n{{customerNumberLine}}\nPhone Number: {{customerPhone}}\nVIN: {{vin}}\nCustomer Concerns: {{serviceDetails}}\n\n{{signature}}"
                      }
                  ]
};
