chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log(request);
  if (request.type === "fetch") {
    sendResponse("message from content (fetch)");
  } else if (request.type === "color") {
    document.body.style.backgroundColor = request.body;
    sendResponse("message from content (color)");
  }
});
