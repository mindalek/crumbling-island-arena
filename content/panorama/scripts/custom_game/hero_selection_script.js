var allHeroes = {};
var heroButtons = {};
var playerColors = {};
var selectedHeroes = {};
var abilityBar = new AbilityBar("#HeroAbilities");
var previewSchedule = 0;

function TableAbilityDataProvider(heroData) {
    this.heroData = heroData;

    this.FilterAbility = function(ability) {
        return ability.name.indexOf("sub") == -1;
    }

    this.FilterAbilities = function() {
        var abilities = [];

        for (key in this.heroData.abilities) {
            var ability = this.heroData.abilities[key];

            if (this.FilterAbility(ability)) {
                abilities.push(ability);
            }
        }

        return abilities;
    }

    this.GetAbilityData = function(slot) {
        var data = {};
        var ability = this.FilterAbilities()[slot];

        data.key = "";
        data.name = ability.name;
        data.texture = ability.texture;
        data.cooldown = 0;
        data.ready = true;
        data.remaining = 0;
        data.activated = true;
        data.enabled = true;
        data.beingCast = false;
        data.toggled = false;

        return data
    }

    this.GetAbilityCount = function() {
        var len = 0;

        for (key in this.heroData.abilities) {
            len++;
        }

        return this.FilterAbilities().length;
    }

    this.ShowTooltip = function(element, data) {
        $.DispatchEvent("DOTAShowAbilityTooltip", element, data.name);
    }
}

function CreateDifficultyLock(loaded) {
    // Dis gon be ugly
    if (!loaded) {
        $.Schedule(0.01, function() {
            if ($("#HardHeroes").actualyoffset == 3.4028234663852886e+38) {
                $.Schedule(0.01, function() { CreateDifficultyLock(false) });
                return;
            }

            CreateDifficultyLock(true);
        });

        return;
    }
    
    var lockedHeroes = $("#HardHeroes");

    var background = $("#HeroSelectionBackground");
    var relationX = 1920 / background.actuallayoutwidth;
    var relationY = 1080 / background.actuallayoutheight;

    var offsetParent = lockedHeroes.GetParent();
    var offsetY = 0;
    var offsetX = 0;

    while (offsetParent.id != "HeroSelectionBackground") {
        offsetY += offsetParent.actualyoffset;
        offsetX += offsetParent.actualxoffset;
        offsetParent = offsetParent.GetParent();
    }

    var lock = $.CreatePanel("Panel", $("#HeroSelectionBackground"), "DifficultyLock");
    var startY = (lockedHeroes.actualyoffset - 3 + offsetY) * relationY;

    var widestRow = _(lockedHeroes.Children()).max(function(row) { return row.actuallayoutwidth });

    var startX = (widestRow.actualxoffset - 3 + offsetX) * relationX;

    lock.style.x = startX + "px";
    lock.style.y = startY + "px";
    lock.style.height = ((lockedHeroes.actuallayoutheight + 6) * relationY) + "px";
    lock.style.width = ((widestRow.actuallayoutwidth + 6) * relationX) + "px";

    var image = $.CreatePanel("Panel", lock, "");
    var text = $.CreatePanel("Label", lock, "");
    text.text = $.Localize("LockedHeroes");
}

function DeleteHeroPreview() {
    var preview = $("#HeroPreview");

    if (preview) {
        preview.visible = false;
        preview.DeleteAsync(1);
    }
}

function ShowHeroPreview(heroName) {
    var previewStyle = "width: 100%; height: 100%; opacity-mask: url(\"s2r://panorama/images/masks/softedge_box_png.vtex\");"
    var preview = $("#HeroPreview")
    preview.LoadLayoutFromStringAsync("<root><Panel><DOTAScenePanel style='" + previewStyle + "' unit='" + heroName + "'/></Panel></root>", false, false);
}

function ShowHeroDetails(heroName) {
    var abilityPanel = $("#HeroAbilities");
    var heroData = allHeroes[heroName];

    abilityBar.SetProvider(new TableAbilityDataProvider(heroData));
    $("#HeroAbilities").visible = true;
    $("#HeroName").text = $.Localize("#HeroName_" + heroData.name);
    $("#HeroTips").text = $.Localize("#HeroTips_" + heroData.name);

    if (previewSchedule != 0) {
        $.CancelScheduled(previewSchedule);
    }

    DeleteHeroPreview();
    var preview = $.CreatePanel("Panel", $("#HeroList"), "HeroPreview");
    $("#HeroList").MoveChildAfter(preview, $("#HeroName"));

    previewSchedule = $.Schedule(0.3, function() {
        previewSchedule = 0;
        ShowHeroPreview(heroName);
    });
}

function HideHeroDetails() {
    abilityBar.SetProvider(new EmptyAbilityDataProvider());
    $("#HeroAbilities").visible = false;
    $("#HeroName").text = "";
    $("#HeroTips").text = "";

    DeleteHeroPreview();
}

function AddHoverHeroDetails(element, heroName){
    var mouseOver = (function(heroName) {
        return function() {
            ShowHeroDetails(heroName);
        }
    } (heroName));

    element.SetPanelEvent("onmouseover", mouseOver);
    element.SetPanelEvent("onmouseout", HideHeroDetails);
}

function PickRandomHero(){
    if (selectedHeroes[Game.GetLocalPlayerID()] == "null") {
        GameEvents.SendCustomGameEventToServer("selection_random", {});
        Game.EmitSound("UI.SelectHeroLocal");
    }
}

function CreatePlayerList(players){
    var playerList = $("#NameColumn");
    DeleteChildrenWithClass(playerList, "NamePanel");

    for (var i = 0; i < players.length; i++) {
        var player = players[i];

        var panel = $.CreatePanel("Panel", playerList, "");
        panel.AddClass("NamePanel");

        var mouseOver = (function(element, id) {
            return function() {
                $.DispatchEvent("DOTAShowProfileCardTooltip", element, id, false);
            }
        } (panel, player.steamId || 0));

        var mouseOut = function(){
            $.DispatchEvent("DOTAHideProfileCardTooltip");
        }

        panel.SetPanelEvent("onmouseover", mouseOver);
        panel.SetPanelEvent("onmouseout", mouseOut);

        var name = $.CreatePanel("Label", panel, "");
        name.AddClass("NameLabel");
        name.text = player["name"];
        name.style.color = player["color"];
    }

    var selectionList = $("#SelectionColumn");
    DeleteChildrenWithClass(selectionList, "SelectionImage");

    for (var i = 0; i < players.length; i++) {
        var selection = $.CreatePanel("DOTAHeroImage", selectionList, "SelectionImage" + players[i].id);
        selection.AddClass("SelectionImage");
        selection.SetScaling("stretch-to-fit-y-preserve-aspect");
        selection.heroimagestyle = "landscape";
        selection.heroname = "";
    }
}

function CreateScoreColumn(players){
    var scoreColumn = $("#ScoreColumn");

    DeleteChildrenWithClass(scoreColumn, "ScorePanel");

    for (var i = 0; i < players.length; i++) {
        var player = players[i];

        var panel = $.CreatePanel("Panel", scoreColumn, "");
        panel.AddClass("ScorePanel");

        var label = $.CreatePanel("Label", panel, "");
        label.AddClass("ScoreText");
        label.text = player.score.toString();
    }
}

function CreateHeroList(heroList, heroes){
    DeleteChildrenWithClass(heroList, "HeroButtonContainer");

    for (var i = 0; i < heroes.length; i += 4) {
        var row = $.CreatePanel("Panel", heroList, "");
        row.AddClass("HeroButtonRow");

        for (var j = i; j < heroes.length && j < i + 4; j++) {
            var container = $.CreatePanel("Panel", row, "");
            container.AddClass("HeroButtonContainer");

            var button = $.CreatePanel("DOTAHeroImage", container, "");
            button.AddClass("HeroButton");
            button.SetScaling("stretch-to-fit-y-preserve-aspect");
            button.heroname = heroes[j];
            button.heroimagestyle = "landscape";

            var mouseOver = (function(element, name) {
                return function() {
                    GameEvents.SendCustomGameEventToServer("selection_hero_hover", { "hero": name });

                    ShowHeroDetails(name);
                }
            } (button, heroes[j]));

            var mouseClick = (function(name) {
                return function() {
                    var heroSelected = _.contains(_.values(selectedHeroes), name);
                    var lock = $("#DifficultyLock");

                    if (heroButtons[name].GetParent().GetParent() == $("#HardHeroes") && lock) {
                        return;
                    }

                    if (selectedHeroes[Game.GetLocalPlayerID()] == "null" && !heroSelected) {
                        GameEvents.SendCustomGameEventToServer("selection_hero_click", { "hero": name });
                        Game.EmitSound("UI.SelectHeroLocal");
                    }
                }
            } (heroes[j]));

            var mouseOut = function(){
                GameEvents.SendCustomGameEventToServer("selection_hero_hover", { "hero": "null" });

                HideHeroDetails();
            }

            button.SetPanelEvent("onactivate", mouseClick);
            button.SetPanelEvent("onmouseover", mouseOver);
            button.SetPanelEvent("onmouseout", mouseOut);

            heroButtons[heroes[j]] = container;
        }
    }
}

function SelectionHoverClient(args){
    var hero = args.hero;
    var selectionImage = $("#SelectionImage" + args["player"]);

    selectionImage.heroname = hero;
    selectionImage.SetHasClass("AnimationImageHover", hero != "null")
}

function OnTimerTick(args){
    if (args["time"] != -1) {
        $("#TimerText").text = args["time"].toString();
    } else {
        $("#TimerText").text = $.Localize("#GameInfoTimesUp");
    }
}

function GameStateChanged(data){
    var bg = $("#HeroSelectionBackground");

    if (data.state == GAME_STATE_HERO_SELECTION){
        bg.style.visibility = "visible";
        SwitchClass(bg, "AnimationBackgroundInvisible", "AnimationBackgroundVisible")
        Game.EmitSound("UI.SelectionStart")

        for (var key in heroButtons) {
            heroButtons[key].style.boxShadow = null;
            heroButtons[key].RemoveClass("HeroButtonSaturated");
        }
    } else {
        SwitchClass(bg, "AnimationBackgroundVisible", "AnimationBackgroundInvisible")
    }
}

function FilterDifficulty(heroes, data, difficulty) {
    return _.filter(heroes, function(hero) {
        return data[hero].difficulty == difficulty;
    });
}

function HeroesUpdated(data){
    var heroes = [];

    for (var key in data){
        heroes.push(key);

        var hero = data[key];

        if (hero.customIcons) {
            for (ability in hero.customIcons) {
                abilityBar.AddCustomIcon(ability, hero.customIcons[ability]);
            }
        }
    }

    var easy = FilterDifficulty(heroes, data, "easy");
    var hard = FilterDifficulty(heroes, data, "hard");

    CreateHeroList($("#EasyHeroes"), easy);
    CreateHeroList($("#HardHeroes"), hard);

    allHeroes = data;
}

function PlayersUpdated(data){
    var players = [];

    for (var key in data){
        var player = data[key];
        var info = Game.GetPlayerInfo(player.id) || {};

        var result = {
            id: player.id,
            score: player.score,
            steamId: info.player_steamid,
            name: Players.GetPlayerName(player.id),
            color: LuaColor(player.color)
        };

        players.push(result);

        playerColors[player.id] = player.color;
    }

    CreatePlayerList(players);
    CreateScoreColumn(players);
}

function HeroSelectionUpdated(data){
    selectedHeroes = data || {};

    $("#RandomHero").enabled = selectedHeroes[Game.GetLocalPlayerID()] == "null";

    for (var key in data){
        var hero = data[key];
        var selectionImage = $("#SelectionImage" + key);
        var id = parseInt(key);
        
        if (hero == "null"){
            selectionImage.RemoveClass("AnimationSelectedHero");
        } else {
            selectionImage.heroname = hero;
            selectionImage.RemoveClass("AnimationImageHover");
            selectionImage.AddClass("AnimationSelectedHero");
            selectionImage.style.boxShadow = LuaColor(playerColors[id]) + " -2px -2px 4px 4px";
            AddHoverHeroDetails(selectionImage, hero);

            heroButtons[hero].style.boxShadow = LuaColor(playerColors[id]) + " -2px -2px 4px 4px";
            //heroButtons[hero].style.saturation = "1.0";
            heroButtons[hero].AddClass("HeroButtonSaturated");
        }
    }
}

function GameInfoChanged(gameInfo) {
    if (!gameInfo) {
        return;
    }

    var lock = $("#DifficultyLock");
    if (gameInfo.hardHeroesLocked) {
        if (!lock)
            CreateDifficultyLock();
    } else {
        if (lock)
            lock.DeleteAsync(0);
    }
}

(function () {
    GameEvents.Subscribe("selection_hero_hover_client", SelectionHoverClient);
    GameEvents.Subscribe("timer_tick", OnTimerTick);

    SubscribeToNetTableKey("main", "heroes", true, HeroesUpdated);
    SubscribeToNetTableKey("main", "players", true, PlayersUpdated);
    SubscribeToNetTableKey("main", "gameState", true, GameStateChanged);
    SubscribeToNetTableKey("main", "gameInfo", true, GameInfoChanged);
    SubscribeToNetTableKey("main", "selectedHeroes", true, HeroSelectionUpdated);
})();