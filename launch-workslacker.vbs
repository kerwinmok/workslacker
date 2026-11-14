' launch workslacker from usb without showing a background command prompt window
Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
batPath = fso.GetParentFolderName(WScript.ScriptFullName) & "\launch-workslacker.bat"
shell.CurrentDirectory = shell.ExpandEnvironmentStrings("%TEMP%")
shell.Run Chr(34) & batPath & Chr(34), 0, False
