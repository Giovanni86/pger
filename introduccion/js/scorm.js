let scorm = pipwerks.SCORM,
    sessionTime,
    seconds,
    minutes,
    hours,
    t,
    callSucceeded,
    viewed = [];


function initScorm () {

    initialTime = new Date();
    scorm.version = "1.2";
    callSucceeded = scorm.init();

    if( callSucceeded ) {
        if( scorm.get('cmi.core.entry') == 'ab-initio') {
            build(true);
        }
        else {
            build(false);
            sessionTime = scorm.get('cmi.core.total_time');
            current = scorm.get('cmi.core.lesson_location');
            viewed = JSON.parse(scorm.get('cmi.suspend_data')); 
        }
    }
    else {
       build(true); 
    }    
    start();
}

function build (_empty) {
    sessionTime = sessionTime || '00:00:00';
    hours = parseInt(sessionTime.split(':')[0]),
    minutes = parseInt(sessionTime.split(':')[1]),
    seconds = parseInt(sessionTime.split(':')[2]);

    for(let i in structure.pages)
    {
        if(_empty) viewed.push(0);
    }

    timer();
}

function timer() {
    t = setInterval(function (){
        seconds++;
        if (seconds >= 60) {
            seconds = 0;
            minutes++;
            if (minutes >= 60) {
                minutes = 0;
                hours++;
            }
        } 
    }, 1000);
}

function getTimeProgress () {
    return (hours ? (hours > 9 ? hours : "0" + hours) : "00") + ":" + (minutes ? (minutes > 9 ? minutes : "0" + minutes) : "00") + ":" + (seconds > 9 ? seconds : "0" + seconds);
}

window.onunload = function (){
	let auxViewed = viewed;
    let auxState = 0;
    let percentage = 0;
	
	for(let j in auxViewed)
	{
		if(auxViewed[j]){
			auxState++;
		}
	}
    
    percentage = Math.ceil((auxState*100) / auxViewed.length);
    scorm.set("cmi.core.lesson_location", current);
	scorm.set("cmi.suspend_data",JSON.stringify(viewed));
	scorm.set("cmi.core.score.raw", percentage);
    scorm.set("cmi.core.session_time", getTimeProgress() );

	if(auxState == auxViewed.length){
        scorm.set("cmi.core.lesson_status", "completed");
        scorm.set("cmi.success_status", "passed");
    }   
	else{
        scorm.set("cmi.core.lesson_status", "incomplete");
    }

    scorm.save();
	callSucceeded = scorm.quit();
}

$(function () {
    initScorm();
    setEvents();
});

