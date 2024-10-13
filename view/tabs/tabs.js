$(".tab").on("click", function(){
    setActiveTab($(this).attr('id'));
    // const $inactiveTab = $('.tab.active');
    // const $inactivePanel = $(".bottompanel .panel").eq($inactiveTab.index());
    // const $activeTab = $(this);
    // const $activePanel = $(".bottompanel .panel").eq($activeTab.index());

    // $inactiveTab.removeClass("active");
    // $inactivePanel.removeClass("active").trigger('inactive');

    // $activeTab.addClass("active");
    // $activePanel.addClass("active").trigger('active');
});

function setActiveTab(tab) {
    const $inactiveTab = $('.tab.active');
    const $inactivePanel = $(".bottompanel .panel").eq($inactiveTab.index());
    $inactiveTab.removeClass("active");
    $inactivePanel.removeClass("active").trigger('inactive');

    const $activeTab = $(`#${tab}`);
    const $activePanel = $(".bottompanel .panel").eq($activeTab.index());
    $activeTab.addClass("active");
    $activePanel.addClass("active").trigger('active');

    localStorage.setItem('tab', tab);
}

$(() => {
    if(params.tab) {
        setActiveTab(params.tab);
        return;
    }

    const lst = localStorage.getItem('tab');
    if(lst) {
        setActiveTab(lst);
        return;
    }

    setActiveTab('uart');
});