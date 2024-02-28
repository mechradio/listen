document.querySelector('body').addEventListener('mainLoaded', () => {
    const managerName =  document.getElementById('module-manager-name');
    const radioName =  document.getElementById('module-radio-name');
    const downloaderName =  document.getElementById('module-downloader-name')
    const listenName =  document.getElementById('module-listen-name')
    const managerStatus =  document.getElementById('module-manager-status');
    const managerUrl =  document.getElementById('module-manager-url');
    const radioStatus =  document.getElementById('module-radio-status');
    const radioUrl =  document.getElementById('module-radio-url');
    const downloaderStatus =  document.getElementById('module-downloader-status');
    const downloaderUrl =  document.getElementById('module-downloader-url');
    const listenStatus =  document.getElementById('module-listen-status');
    const listenUrl =  document.getElementById('module-listen-url');
    listenName.innerHTML = languageStrings.listenModule + ' | v' + version
    managerName.innerHTML = languageStrings.manager
    radioName.innerHTML = languageStrings.radio
    downloaderName.innerHTML = languageStrings.downloader

    listenUrl.innerHTML = window.location.href

    function toggleOnline(el) {
        el.classList.add('online')
        el.classList.remove('idle')
        el.classList.remove('problem')
    }

    function toggleConnecting(el) {
        el.classList.remove('online')
        el.classList.remove('idle')
        el.classList.add('problem')
    }

    function toggleIdle(el) {
        el.classList.remove('online')
        el.classList.remove('problem')
        el.classList.add('idle')
    }

    function checkOnlineStatus() {
        if(navigator.onLine) toggleOnline(listenStatus)
        else toggleConnecting(listenStatus)
    }

    checkOnlineStatus()
    setInterval(() => {
        checkOnlineStatus()
    }, 1000);
    // Modules status changes
    socket.on('status', a => {
        managerUrl.innerHTML = a["manager"]["url"]
        managerName.innerHTML = languageStrings.manager + ' | v' + a["manager"]["version"]
        if(a["manager"]["status"] == 1) toggleOnline(managerStatus)
        else if(a["manager"]["status"] == 0) toggleConnecting(managerStatus)
        else if(a["manager"]["status"] == 2) toggleIdle(managerStatus)

        radioUrl.innerHTML = a["radio"]["url"]
        radioName.innerHTML = languageStrings.radio + ' | v' + a["radio"]["version"]
        if(a["radio"]["status"] == 1) toggleOnline(radioStatus);
        else if(a["radio"]["status"] == 0) toggleConnecting(radioStatus)
        else if(a["radio"]["status"] == 2) toggleIdle(radioStatus)

        downloaderUrl.innerHTML = a["downloader"]["url"]
        downloaderName.innerHTML = languageStrings.downloader + ' | v' + a["downloader"]["version"]
        if(a["downloader"]["status"] == 1) toggleOnline(downloaderStatus)
        else if(a["downloader"]["status"] == 0) toggleConnecting(downloaderStatus)
        else if(a["downloader"]["status"] == 2) toggleIdle(downloaderStatus)
    })

    socket.on('disconnect', () => {
        toggleConnecting(managerStatus)
        toggleConnecting(radioStatus)
        toggleConnecting(downloaderStatus)
    })
        // sessionIDText.innerHTML = "Web"+": "+version +'<br>' + "Manager"+": "+mv+" | "+"Radio: " +rv + " | " + "Downloader: " + dv + "<br>" + languageStrings.sessionID+": "+id
    document.querySelector('body').dispatchEvent(new Event('statusesLoaded'));  // Everything loaded!
})