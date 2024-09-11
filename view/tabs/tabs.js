$(".tab").on("click", function(){
    const $inactiveTab = $('.tab.active');
    const $inactivePanel = $(".bottompanel .panel").eq($inactiveTab.index());
    const $activeTab = $(this);
    const $activePanel = $(".bottompanel .panel").eq($activeTab.index());

    $inactiveTab.removeClass("active");
    $inactivePanel.removeClass("active").trigger('inactive');

    $activeTab.addClass("active");
    $activePanel.addClass("active").trigger('active');
});

$(() => {
    const $activeTab = $('.bottompanel .tabs .tab.active');
    const $activePanel = $(".bottompanel .panel").eq($activeTab.index());
    $activePanel.addClass("active").trigger('active');
});