var emotes = {
    "4Head": 354,
    "ANELE": 3792,
    "ArgieB8": 51838,
    "ArsonNoSexy": 50,
    "AsianGlow": 74,
    "AthenaPMS": 32035,
    "BabyRage": 22639,
    "BatChest": 1905,
    "BCouch": 83536,
    "BCWarrior": 30,
    "BibleThump": 86,
    "BigBrother": 1904,
    "BionicBunion": 24,
    "BlargNaut": 38,
    "bleedPurple": 62835,
    "BloodTrail": 69,
    "BORT": 243,
    "BrainSlug": 881,
    "BrokeBack": 4057,
    "BuddhaBar": 27602,
    "ChefFrank": 90129,
    "cmonBruh": 84608,
    "CoolCat": 58127,
    "CorgiDerp": 49106,
    "CougarHunt": 21,
    "DAESuppy": 973,
    "DansGame": 33,
    "DatSheffy": 170,
    "DBstyle": 73,
    "deExcite": 46249,
    "deIlluminati": 46248,
    "DendiFace": 58135,
    "DogFace": 1903,
    "DOOMGuy": 54089,
    "duDudu": 62834,
    "EagleEye": 20,
    "EleGiggle": 4339,
    "FailFish": 360,
    "FPSMarksman": 42,
    "FrankerZ": 65,
    "FreakinStinkin": 39,
    "FUNgineer": 244,
    "FunRun": 48,
    "FuzzyOtterOO": 168,
    "GingerPower": 32,
    "GrammarKing": 3632,
    "HassaanChop": 20225,
    "HassanChop": 68,
    "HeyGuys": 30259,
    "HotPokket": 357,
    "HumbleLife": 46881,
    "ItsBoshyTime": 169,
    "Jebaited": 90,
    "JKanStyle": 15,
    "JonCarnage": 26,
    "KAPOW": 9803,
    "Kappa": 25,
    "KappaClaus": 74510,
    "KappaPride": 55338,
    "KappaRoss": 70433,
    "KappaWealth": 81997,
    "Keepo": 1902,
    "KevinTurtle": 40,
    "Kippa": 1901,
    "Kreygasm": 41,
    "Mau5": 30134,
    "mcaT": 35063,
    "MikeHogu": 81636,
    "MingLee": 68856,
    "MrDestructoid": 28,
    "MVGame": 29,
    "NinjaTroll": 45,
    "NomNom": 90075,
    "NoNoSpot": 44,
    "NotATK": 34875,
    "NotLikeThis": 58765,
    "OhMyDog": 81103,
    "OMGScoots": 91,
    "OneHand": 66,
    "OpieOP": 356,
    "OptimizePrime": 16,
    "OSfrog": 81248,
    "OSkomodo": 81273,
    "OSsloth": 81249,
    "panicBasket": 22998,
    "PanicVis": 3668,
    "PartyTime": 76171,
    "PazPazowitz": 19,
    "PeoplesChamp": 3412,
    "PermaSmug": 27509,
    "PeteZaroll": 81243,
    "PeteZarollTie": 81244,
    "PicoMause": 27,
    "PipeHype": 4240,
    "PJSalt": 36,
    "PMSTwin": 92,
    "PogChamp": 88,
    "Poooound": 358,
    "PraiseIt": 38586,
    "PRChase": 28328,
    "PunchTrees": 47,
    "PuppeyFace": 58136,
    "RaccAttack": 27679,
    "RalpherZ": 1900,
    "RedCoat": 22,
    "ResidentSleeper": 245,
    "riPepperonis": 62833,
    "RitzMitz": 4338,
    "RuleFive": 361,
    "SeemsGood": 64138,
    "ShadyLulu": 52492,
    "ShazBotstix": 87,
    "ShibeZ": 27903,
    "SmoocherZ": 89945,
    "SMOrc": 52,
    "SMSkull": 51,
    "SoBayed": 1906,
    "SoonerLater": 355,
    "SriHead": 14706,
    "SSSsss": 46,
    "StinkyCheese": 90076,
    "StoneLightning": 17,
    "StrawBeary": 37,
    "SuperVinlin": 31,
    "SwiftRage": 34,
    "TBCheesePull": 94039,
    "TBTacoLeft": 94038,
    "TBTacoRight": 94040,
    "TF2John": 1899,
    "TheRinger": 18,
    "TheTarFu": 70,
    "TheThing": 7427,
    "ThunBeast": 1898,
    "TinyFace": 67,
    "TooSpicy": 359,
    "TriHard": 171,
    "TTours": 38436,
    "twitchRaid": 62836,
    "UleetBackup": 49,
    "UncleNox": 3666,
    "UnSane": 71,
    "VaultBoy": 54090,
    "VoHiYo": 81274,
    "Volcania": 166,
    "WholeWheat": 1896,
    "WinWaker": 167,
    "WTRuck": 1897,
    "WutFace": 28087,
    "YouWHY": 4337
};

var template = "https://static-cdn.jtvnw.net/emoticons/v1/{image_id}/1.0";

function InsertEmotes(input) {
    input = encodeURI(input);
    
    for (var emote in emotes) {
        var url = template.replace("{image_id}", emotes[emote]);
        input = input.replace(new RegExp("\\b" + emote + "\\b", "g"), "<img src='" + url + "'/>");
    }

    return input;
}