const tabs = Array.from(document.querySelectorAll('.tabs > .tab[aria-controls]'));

function setActiveTab(id) {
    const active = tabs.find(tab => tab.id === id) ?? tabs[0];
    for (const tab of tabs) {
        const selected = tab === active;
        const panel = document.getElementById(tab.getAttribute('aria-controls'));
        tab.classList.toggle('active', selected);
        tab.setAttribute('aria-pressed', String(selected));
        if (panel.classList.toggle('active', selected)) $(panel).trigger('active');
    }
    localStorage.setItem('tab', active.id);
}

for (const tab of tabs) {
    tab.addEventListener('click', () => setActiveTab(tab.id));
}

setActiveTab(params.tab ?? localStorage.getItem('tab'));
