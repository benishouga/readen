export function acquireCurrentTab() {
  return new Promise<chrome.tabs.Tab>((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => resolve(tabs[0]));
  });
}

export async function requestToContent<T>(message: any) {
  const tab = await acquireCurrentTab();
  return new Promise<T>((resolve) => {
    if (!tab.id) return;
    chrome.tabs.sendMessage(tab.id, message, (res) => {
      resolve(res);
    });
  });
}
