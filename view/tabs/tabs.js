const tabs = Array.from(document.querySelectorAll('.tabs > .tab[aria-controls]'));
const desktopLayout = matchMedia('(min-width: 72rem)');
const debuggerLayout = document.getElementById('toppanel');
let preferredTab = tabs.find(tab => tab.id === (params.tab ?? localStorage.getItem('tab'))) ?? tabs[0];

function updateTabs() {
    const docked = desktopLayout.matches && !debuggerLayout.classList.contains('theater-mode');
    const active = docked && preferredTab.id === 'disassemble-tab'
        ? document.getElementById('memory-tab')
        : preferredTab;
    for (const tab of tabs) {
        const selected = tab === active;
        const panel = document.getElementById(tab.getAttribute('aria-controls'));
        tab.hidden = docked && tab.id === 'disassemble-tab';
        tab.setAttribute('aria-pressed', String(selected));
        if (panel.classList.toggle('active', selected)) $(panel).trigger('active');
    }
}

function setActiveTab(id) {
    preferredTab = tabs.find(tab => tab.id === id) ?? tabs[0];
    localStorage.setItem('tab', preferredTab.id);
    updateTabs();
}

for (const tab of tabs) {
    tab.addEventListener('click', () => setActiveTab(tab.id));
}

desktopLayout.addEventListener('change', updateTabs);
$(debuggerLayout).on('layoutchange', updateTabs);
updateTabs();
