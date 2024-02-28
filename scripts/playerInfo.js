// When main script loaded
document.querySelector('body').addEventListener('statusesLoaded', () => {
    const nextInQueue = document.getElementById('next-in-queue');
    nextInQueue.innerHTML = languageStrings.nextInQueue + ':'
    const currentlyPlayingTitle = document.getElementById('currently-playing-title');
    const currentlyPlayingAuthor = document.getElementById('currently-playing-author');
    const currentlyPlaying = document.getElementById('currently-playing-info');
    const imagesWait = document.getElementsByClassName('image-wait');
    const currentlyPlayingImage = document.getElementById('currently-playing-image');
    const additional = document.getElementById('currently-playing-additional');
    const timerElement = document.getElementById("currently-playing-timer");
    const player = document.getElementById('player');
    const queueBox = document.getElementById('queue-box');
    const queueDiv = document.getElementById('queue-elements');
    const queueElementConstructor = `
        <div id="{i}" style="transition: opacity 1s ease-in-out, height 1s ease-in-out; height: 0px; opacity: 0">
            <div class="player-info">
                <div class="images">
                    <img src={img}>
                </div>
                <div class="text-info" >
                    <b><p class="title">{title}</p></b>
                    <p class="author">{author}</p>
                </div>
            </div>
            <p class="timer">{duration}</p>
        </div>
    `;
    let duration = -1, playtime = -1, currentUpdateInterval, updatingQueue, previousQ = [0];

    // Function for changing from seconds to pretty format
    function formatDuration(durationInSeconds) {
        durationInSeconds = Math.floor(durationInSeconds);
        const minutes = Math.floor(durationInSeconds / 60);
        const seconds = durationInSeconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    // Update timer element
    function updateTimer() {
        timerElement.textContent = formatDuration(duration - playtime);
        playtime++;
    }

    socket.on('radio', async q => {
        if(!q) return
        while(updatingQueue) {
            await new Promise(r => setTimeout(r, 300));
            q[0].time+=0.3
        }
        updatingQueue = true

        if (previousQ[0]["author"] != q[0]["author"] || previousQ[0]["thumbnail"] != q[0]["thumbnail"] || previousQ[0]["title"] != q[0]["title"] || previousQ[0]["duration"] != q[0]["duration"]) {

            clearInterval(currentUpdateInterval); // Stop timer
            let ph = 90

            // If should move up queue
            const shouldMoveUp = currentlyPlayingImage.classList.contains('hidden') ? false : true

            player.style.opacity = 0
        
            let firstInQ
            if(shouldMoveUp) {
                firstInQ = document.getElementById(1)
                if(firstInQ) {
                    // Hide first in queue
                    firstInQ.style.height = 0
                    firstInQ.style.opacity = 0
                    for (let i = 1; i <= queueDiv.childElementCount; i++) {
                        try {
                            const el = document.getElementById(i)
                            el.id = i - 1
                        } catch (e) {}
                    }
                }
            }  
            await new Promise(r => setTimeout(r, 900));
            q[0].time+=0.9
            if(firstInQ) firstInQ.remove()

            currentlyPlayingImage.src = radioUrl + '/' + q[0].thumbnail // Set image
            currentlyPlayingImage.classList.remove('hidden')
            imagesWait[0].classList.add('hidden')
            currentlyPlayingTitle.innerHTML = q[0].title
            currentlyPlayingAuthor.innerHTML = q[0].author
            currentlyPlaying.classList.remove('hidden')
    
            additional.classList.remove('hidden')
            // Eurovision song detected
            if(q[0].additional.ev) {
                const year = q[0].additional.ev.split(';')[0]
                const countryISO = q[0].additional.ev.split(';')[1]
                additional.innerHTML = languageStrings.eurovision + ' ' + year + '<br>' + languageStrings[countryISO]
                ph+=55
            }
            // New song detected
            else if(q[0].additional.n) {
                additional.innerHTML = languageStrings.new
                ph+=35
            }
            // Else hide additional
            else additional.classList.add('hidden')

            // Show player again
            player.style.height = ph + 'px'
            player.style.opacity = 1

            // Update timer
            duration = q[0].duration
            playtime = q[0].time
            updateTimer()
            currentUpdateInterval = setInterval(updateTimer, 1000)

            // Only player update is needed
            if (q.length == 0) {
                queueBox.classList.add('hidden')
                await new Promise(r => setTimeout(r, 800));
            }
            updatingQueue = false

            if(previousQ[0] == 0) previousQ = q;
            else return previousQ = q;
        }
        
        queueBox.classList.remove('hidden')
        
        queueDiv.innerHTML = ''
        queueConstruct = a => {
            const constr = queueElementConstructor
                                .replace('{i}', a)
                                .replace('{img}', radioUrl + '/' + q[a].thumbnail)
                                .replace('{title}', q[a].title)
                                .replace('{author}', q[a].author)
                                .replace('{duration}', formatDuration(q[a].duration));
            queueDiv.innerHTML += constr
        }
        let i = 0
        q.forEach(() => {
            if(i == 0) return i++;
            queueConstruct(i)
            i++
        });
        i=0
        await new Promise(r => setTimeout(r, 100));
        q.forEach(() => {
            if(i == 0) return i++;
            const anim = document.getElementById(i)
            anim.style.opacity = 1
            anim.style.height = '100px'
            i++
        })
        i=0
        await new Promise(r => setTimeout(r, 800));
        updatingQueue = false
    })

    document.querySelector('body').dispatchEvent(new Event('allLoaded'));  // Everything loaded!
})
