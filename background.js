browser.tabs.onActivated.addListener(async (activeInfo) => {
    setTimeout(async () => {
        browser.storage.local.set({ 'previousTabId': activeInfo.tabId });
    }, 100);
});

browser.tabs.onCreated.addListener(async (tab) => {
    // Get previous tab
    const { previousTabId } = (await browser.storage.local.get('previousTabId'));
    if (!previousTabId) {
        return;
    }

    try {
        let previous = await browser.tabs.get(previousTabId);

        // No group, normal tab
        if (previous.groupId == -1) return;

        await browser.tabs.group({
            groupId: previous.groupId,
            tabIds: tab.id,
        });
    } catch (e) {
        console.error(e);
        return;
    }
});