const schedule = require('node-schedule');
const config = require('./config');
const workingHours = config.workingHours;

module.exports.isNowWorkingHour = function(){
    return getNextWorkingHour() === false;
}

module.exports.scheduleTask = function(cb){
    let date = getNextWorkingHour();
    if(config.verbose) console.log("INFO: Scheduling review for: " + date);
    schedule.scheduleJob(date, function(){
        if(config.verbose) console.log("INFO: launching scheduled job");
        cb();
    });
}

function getNextWorkingHour(){
    let now = new Date();
    let dayOfTheWeek = now.getDay();
    let actualHour = now.getHours();

    let dayLiteral = getDayStr(dayOfTheWeek);

    // if today is off or we're past working hours, return the beginning of the next working day
    if(!workingHours[dayLiteral] || actualHour >= workingHours[dayLiteral].to){
        return startOfNextWorkingDay(now);
    }

    // if we're in working hours, no need to schedule
    if(actualHour >= workingHours[dayLiteral].from && actualHour < workingHours[dayLiteral].to){
        return false;
    }

    // if today is a working day but the time is before working hours, return the beginning of the working horus
    if(actualHour < workingHours[dayLiteral].from){
        let result = new Date();
        result.setHours(workingHours[dayLiteral].from);
        result.setMinutes(0);
        result.setSeconds(0);
        return result;
    }
}

function getDayStr(dayOfTheWeek){
    switch(dayOfTheWeek){
        case 0: return "sun";
        case 1: return "mon";
        case 2: return "tue";
        case 3: return "wed";
        case 4: return "thu";
        case 5: return "fri";
        case 6: return "sat";
    }
}

function startOfNextWorkingDay(date){
    let dayOfTheWeek = date.getDay();
    // find next working day
    for(let i = 1; i < 7; i++){
        let dayLiteral = getDayStr((dayOfTheWeek + i) % 7);
        if(workingHours[dayLiteral]){
            let result = new Date(date);
            result.setDate(result.getDate() + i);
            result.setHours(workingHours[dayLiteral].from);
            result.setMinutes(0);
            result.setSeconds(0);
            return result;
        }
    }
}