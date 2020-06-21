var _localStorageItemName;
var _playerName;
var _score;

var newAllTimeBest;
var newAllTimeWorst;
var newSessionBest;
var newSessionWorst;
var newWonder;

function nameSelectButtonPressed() {
    let element = document.getElementById('names');
    if (element.value === '') return;

    _playerName = element.value;
    _localStorageItemName = 'rollTheDice' + _playerName;

    //removeLocalData();
    _score = getLocalData();
    resetSessionScore();
    populateAllScore();

    document.getElementById('name').innerHTML += " " + _playerName;
    document.getElementById('name').style.color = getPlayerColor();
    document.getElementById('enterName').style.display = 'none';
    let playDiv = document.getElementById('play');
    playDiv.style.display = 'block';
}

function buttonPressed() {
    document.getElementById('clickMe').disabled = true;

    newAllTimeBest = false;
    newAllTimeWorst = false;
    newSessionBest = false;
    newSessionWorst = false;
    newWonder = false;

    _score.sessionAttempts += 1;
    _score.allAttempts += 1;
    if (_score.allAttemptsSinceLastWonder === 'N/A') _score.allAttemptsSinceLastWonder = 0;
    _score.allAttemptsSinceLastWonder += 1;

    let diceRolls = rollTheDiceUntilMaxResult();
    _score.sessionTotal += diceRolls;

    evaluateDiceRolls(diceRolls);
    populateAllScore();

    let newLine = "Attempt: " + _score.sessionAttempts + " - " + "Score: " + diceRolls + ' die casts to roll 5x6' + newRecordString(diceRolls) + "\n";
    document.getElementById('messages').value = newLine + document.getElementById('messages').value;

    localStorage.setItem(_localStorageItemName, JSON.stringify(_score));
    document.getElementById('clickMe').disabled = false;

    if (newWonder) alert('GEFELICITEERD!!! Je hebt in 1 roll 5x6 als resultaat. Wanneer ga je trakteren?');
}

function rollTheDiceUntilMaxResult() {
    let count = 0;
    let result;

    while (result != 30) {
        count += +1;
        result = rollTheDice();
    }

    return count;
}

function rollTheDice() {
    let dice = rollDice(5);
    return dice[0] + dice[1] + dice[2] + dice[3] + dice[4];
}

function rollDice(times) {
    var randomDices = [];
    while (randomDices.length < times) {
        var rand = Math.floor(6 * Math.random()) + 1;
        randomDices.push(rand);
    }
    return randomDices
}

function evaluateDiceRolls(diceRolls) {
    checkForWonder(diceRolls);
    checkBest(diceRolls);
    checkWorst(diceRolls);
}

function checkForWonder(diceRolls) {
    if (diceRolls != 1) return;
    _score.allOneRollWonders += 1;
    if (_score.allLeastAttemptsRequired === 'N/A') _score.allLeastAttemptsRequired = 0;
    if (_score.allLeastAttemptsRequired === 0) _score.allLeastAttemptsRequired = _score.allAttemptsSinceLastWonder;
    else {
        if (_score.allLeastAttemptsRequired > _score.allAttemptsSinceLastWonder) _score.allLeastAttemptsRequired = _score.allAttemptsSinceLastWonder;
    }
    _score.allAttemptsSinceLastWonder = 0;
    newWonder = true;
}

function checkBest(diceRolls) {
    if (_score.sessionBest === 'N/A') _score.sessionBest = 0;
    if (_score.allBest === 'N/A') _score.allBest = 0;

    if (_score.sessionBest === diceRolls || _score.sessionBest != 0 && _score.sessionBest < diceRolls) return;

    if (_score.sessionBest != 0) newSessionBest = true;
    _score.sessionBest = diceRolls;

    if (_score.allBest === 0) _score.allBest = diceRolls;
    else if (_score.allBest > diceRolls) {
        _score.allBest = diceRolls;
        newAllTimeBest = true;
    }
}

function checkWorst(diceRolls) {
    if (_score.sessionWorst === 'N/A') _score.sessionWorst = 0;
    if (_score.allWorst === 'N/A') _score.allWorst = 0;

    if (_score.sessionWorst === diceRolls || _score.sessionWorst != 0 && _score.sessionWorst > diceRolls) return;

    if (_score.sessionWorst != 0) newSessionWorst = true;
    _score.sessionWorst = diceRolls;

    if (_score.allWorst === 0) _score.allWorst = diceRolls;
    else if (_score.allWorst < diceRolls) {
        _score.allWorst = diceRolls;
        newAllTimeWorst = true;
    }
}

function resetSessionScore() {
    _score.sessionAttempts = 0;
    _score.sessionBest = 'N/A';
    _score.sessionWorst = 'N/A';
    _score.sessionAverage = 0;
    _score.sessionTotal = 0;
}

function populateAllScore() {
    // Session score
    document.getElementById('total').innerHTML = 'Attempts: ' + _score.sessionAttempts;
    document.getElementById('best').innerHTML = 'Best: ' + _score.sessionBest;
    document.getElementById('worst').innerHTML = 'Worst: ' + _score.sessionWorst;
    document.getElementById('average').innerHTML = 'Average: ' + Math.round(_score.sessionTotal / _score.sessionAttempts);
    // All-time score
    document.getElementById('allTimeAttempts').innerHTML = 'Attempts: ' + _score.allAttempts;
    document.getElementById('allTimeBest').innerHTML = 'Best: ' + _score.allBest;
    document.getElementById('allTimeWorst').innerHTML = 'Worst: ' + _score.allWorst;
    document.getElementById('allTimeWonders').innerHTML = 'One-roll wonders: ' + _score.allOneRollWonders;
    document.getElementById('triesSinceLastWonder').innerHTML = 'Attempts since last wonder: ' + _score.allAttemptsSinceLastWonder;
    document.getElementById('leastAttemptsRequired').innerHTML = 'Least attempts required: ' + _score.allLeastAttemptsRequired;
}

function newRecordString(score) {
    let text = '';
    if (score === 1) {
        text += '\n^^^ !!!!!! THE ONE-ROLL WONDER !!!!!! ^^^';
    } else if (newAllTimeBest) {
        text += '\n^^^ NEW ALL TIME BEST!!! ^^^';
    } else if (newAllTimeWorst) {
        text += '\n^^^ NEW ALL TIME WORST!!! ^^^';
    } else if (newSessionBest) {
        text += '\n^ new session best! ^';
    } else if (newSessionWorst) {
        text += '\n^ new session worst! ^';
    }
    return text;
}


function getLocalData() {
    let localData = localStorage.getItem(_localStorageItemName);
    if (localData === null) {
        createLocalData();
        localData = localStorage.getItem(_localStorageItemName);
    }
    return JSON.parse(localData);
}

function removeLocalData() {
    localStorage.removeItem(_localStorageItemName);
}

function createLocalData() {
    let rollTheDiceData = {
        player: _playerName,
        allAttempts: 0,
        allBest: 'N/A',
        allWorst: 'N/A',
        allOneRollWonders: 0,
        allAttemptsSinceLastWonder: 'N/A',
        allLeastAttemptsRequired: 'N/A',
        sessionBest: 'N/A',
        sessionWorst: 'N/A',
        sessionTotal: 0,
        sessionAverage: 0,
        sessionAttempts: 0
    }
    localStorage.setItem(_localStorageItemName, JSON.stringify(rollTheDiceData));
}

function getPlayerColor() {
    if (_playerName === 'Lieke') return '#800020';
    else if (_playerName === 'Patrick') return '#000080';
}