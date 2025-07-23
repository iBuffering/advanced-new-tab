/**
 * Sets the previosTab ID.
 *
 * If `id` is null, the key will be removed.
 *
 * @param {number|null} id
 */
async function setPreviousTabID(id) {
    if (id === null) {
        await browser.storage.local.remove('previousTabId');
    } else {
        await browser.storage.local.set({ 'previousTabId': id });
    }
}

/**
 * Returns the previous tab's ID, or null.
 * @returns {Promise<number|null>}
 */
async function getPreviousTabID() {
    const { previousTabId } = (await browser.storage.local.get('previousTabId'))
    if (previousTabId) {
        return parseInt(previousTabId);
    }
    return null;
}

async function createNewTabIgnoreGroup() {
    await setPreviousTabID(null);
    await browser.tabs.create({ active: true });
}

// Every time the active tab changes, the tab's ID gets stored.
browser.tabs.onActivated.addListener(async (activeInfo) => {
    setTimeout(async () => {
        await setPreviousTabID(activeInfo.tabId);
    }, 100);
});

// browser.action.onClicked.addListener(async () => {
//     await createNewTabIgnoreGroup();
// });

browser.commands.onCommand.addListener(async (commandName) => {
    if (commandName == 'newTabIgnoreGroup') {
        await createNewTabIgnoreGroup();
    }
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