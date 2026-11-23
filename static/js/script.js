
document.addEventListener("DOMContentLoaded", () => {

    // Photos received from Flask
    const photos = window.BIRTHDAY_PHOTOS || [];

    // Sections
    const hero = document.getElementById("hero");
    const reveal = document.getElementById("reveal");
    const filmSection = document.getElementById("gallery");
    const filmStage = document.getElementById("film-stage");
    const collageSection = document.getElementById("collage-section");
    const collage = document.getElementById("memory-collage");
    const finalScreen = document.getElementById("final-screen");

    // Buttons
    const surpriseBtn = document.getElementById("surpriseBtn");
    const memoriesBtn = document.getElementById("memoriesBtn");
    const replayBtn = document.getElementById("replayBtn");

    let filmRunning = false;
    let musicEnabled = true;
    let fadeTimer = null;

    // =========================================
    // BACKGROUND MUSIC
    // =========================================

    const music = new Audio("/static/music/birthday.mp3");
    music.loop = true;
    music.volume = 0;
    music.preload = "auto";

    // Music button
    const musicButton = document.createElement("button");

    musicButton.id = "musicToggle";
    musicButton.innerHTML = "♫ Music On";

    Object.assign(musicButton.style, {
        position: "fixed",
        bottom: "25px",
        right: "25px",
        zIndex: "9999",
        padding: "12px 20px",
        borderRadius: "50px",
        border: "1px solid rgba(255, 220, 160, 0.5)",
        background: "rgba(35, 20, 35, 0.85)",
        color: "#f5dfb0",
        fontSize: "14px",
        letterSpacing: "1px",
        cursor: "pointer",
        backdropFilter: "blur(10px)",
        display: "none"
    });

    document.body.appendChild(musicButton);

    function updateMusicButton() {
        musicButton.innerHTML = musicEnabled
            ? "♫ Music On"
            : "♫ Music Off";
    }

    function stopFade() {
        if (fadeTimer) {
            clearInterval(fadeTimer);
            fadeTimer = null;
        }
    }

    function fadeMusic(targetVolume, duration = 2500) {
        stopFade();

        const startVolume = music.volume;
        const difference = targetVolume - startVolume;
        const steps = 50;
        const interval = duration / steps;
        let step = 0;

        fadeTimer = setInterval(() => {
            step++;

            music.volume = Math.max(
                0,
                Math.min(1, startVolume + difference * (step / steps))
            );

            if (step >= steps) {
                music.volume = targetVolume;
                stopFade();
            }
        }, interval);
    }

    async function startMusic() {
        if (!musicEnabled) return;

        try {
            await music.play();
            fadeMusic(0.45, 3500);
            musicButton.style.display = "block";
            updateMusicButton();
        } catch (error) {
            console.log("Music could not start:", error);
        }
    }

    function fadeOutMusic() {
        stopFade();

        const startVolume = music.volume;
        const steps = 40;
        let step = 0;

        fadeTimer = setInterval(() => {
            step++;

            music.volume = Math.max(
                0,
                startVolume * (1 - step / steps)
            );

            if (step >= steps) {
                music.volume = 0;
                music.pause();
                stopFade();
            }
        }, 50);
    }

    musicButton.addEventListener("click", async () => {

        if (musicEnabled) {
            musicEnabled = false;
            stopFade();
            music.pause();
            music.volume = 0;
            updateMusicButton();
        } else {
            musicEnabled = true;
            updateMusicButton();
            await startMusic();
        }
    });

    // =========================================
    // FLOATING LIGHT PARTICLES
    // =========================================

    const particleContainer = document.getElementById("particles");

    if (particleContainer) {
        for (let i = 0; i < 40; i++) {
            const particle = document.createElement("span");

            particle.className = "particle";
            particle.style.left = Math.random() * 100 + "%";
            particle.style.animationDuration =
                (8 + Math.random() * 12) + "s";
            particle.style.animationDelay =
                (Math.random() * 10) + "s";

            const size = 2 + Math.random() * 3;

            particle.style.width = size + "px";
            particle.style.height = size + "px";

            particleContainer.appendChild(particle);
        }
    }

    // =========================================
    // OPENING SCREEN
    // =========================================

    surpriseBtn.addEventListener("click", async () => {

        // Start music on the user's click
        await startMusic();

        hero.style.transition = "opacity 1.5s ease";
        hero.style.opacity = "0";

        setTimeout(() => {
            hero.style.display = "none";

            reveal.classList.add("active");
            reveal.style.display = "flex";

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        }, 1200);
    });

    // =========================================
    // PHOTO CHAPTERS
    // =========================================

    const chapters = [
        {
            title: "The Beautiful Beginning",
            subtitle: "MOMENTS THAT MAKE US SMILE",
            start: 0,
            end: Math.min(10, photos.length)
        },
        {
            title: "Little Moments, Big Memories",
            subtitle: "MEMORIES WE HOLD CLOSE",
            start: 10,
            end: Math.min(20, photos.length)
        },
        {
            title: "A Life Full of Love",
            subtitle: "EVERY MOMENT IS A TREASURE",
            start: 20,
            end: photos.length
        }
    ];

    // Each photo gets a different effect
    const effects = [
        "effect-zoom",
        "effect-zoomout",
        "effect-left",
        "effect-right",
        "effect-rise",
        "effect-drift",
        "effect-focus",
        "effect-rotate"
    ];

    function wait(milliseconds) {
        return new Promise(resolve =>
            setTimeout(resolve, milliseconds)
        );
    }

    // Chapter title
    async function showChapterTitle(chapter) {

        const title = document.createElement("div");

        title.className = "chapter-title";

        title.innerHTML = `
            <small>${chapter.subtitle}</small>
            <h2>${chapter.title}</h2>
        `;

        filmStage.appendChild(title);

        await wait(3500);

        title.remove();
    }

    // Display individual photo
    async function displayPhoto(photoName, index) {

        const frame = document.createElement("div");

        frame.className = "photo-frame";
        frame.classList.add(effects[index % effects.length]);

        const image = document.createElement("img");

        image.src = `/static/photos/${encodeURIComponent(photoName)}`;
        image.alt = `Memory ${index + 1}`;
        image.draggable = false;

        frame.appendChild(image);
        filmStage.appendChild(frame);

        // Wait for the photo to load
        if (!image.complete) {
            await new Promise(resolve => {
                image.onload = resolve;
                image.onerror = resolve;
            });
        }

        requestAnimationFrame(() => {
            frame.classList.add("active");
        });

        // Photo display duration
        await wait(4300);

        frame.classList.remove("active");

        await wait(1200);

        frame.remove();
    }

    // =========================================
    // START THE PHOTO FILM
    // =========================================

    async function startFilm() {

        if (filmRunning) return;

        if (photos.length === 0) {
            alert("No photos were found. Please check the photos folder.");
            return;
        }

        filmRunning = true;

        reveal.classList.remove("active");
        reveal.style.display = "none";

        filmSection.classList.add("active");
        filmStage.innerHTML = "";

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

        // Play each chapter
        for (const chapter of chapters) {

            if (chapter.start >= chapter.end) continue;

            await showChapterTitle(chapter);

            for (let i = chapter.start; i < chapter.end; i++) {
                await displayPhoto(photos[i], i);
            }

            await wait(1000);
        }

        filmSection.classList.remove("active");

        await wait(1200);

        // Transition to collage
        await startCollage();
    }

    // =========================================
    // COLLAGE FINALE
    // =========================================

    async function startCollage() {

        collageSection.style.display = "";
        collageSection.classList.add("active");

        collage.innerHTML = "";
        collage.style.transform = "";
        collage.style.opacity = "";
        collage.style.transition = "";

        const totalPhotos = photos.length;
        const isMobile = window.innerWidth < 600;

        const columns = isMobile ? 5 : 7;
        const rows = Math.ceil(totalPhotos / columns);

        const tileWidth = isMobile ? 18 : 13;
        const tileHeight = isMobile ? 12 : 17;

        const horizontalGap =
            (100 - tileWidth * columns) / (columns - 1);

        const verticalGap =
            rows > 1
                ? (100 - tileHeight * rows) / (rows - 1)
                : 0;

        const collageImages = [];

        // Create all photo tiles
        photos.forEach((photo, index) => {

            const image = document.createElement("img");

            image.className = "collage-photo";
            image.src = `/static/photos/${encodeURIComponent(photo)}`;
            image.alt = `Memory ${index + 1}`;
            image.draggable = false;

            const row = Math.floor(index / columns);
            const column = index % columns;

            image.style.width = tileWidth + "%";
            image.style.height = tileHeight + "%";

            image.style.left =
                (column * (tileWidth + horizontalGap)) + "%";

            image.style.top =
                (row * (tileHeight + verticalGap)) + "%";

            collage.appendChild(image);
            collageImages.push(image);
        });

        // Fly in photos one by one
        for (let i = 0; i < collageImages.length; i++) {

            collageImages[i].classList.add("visible", "fly");

            await wait(140);
        }

        // Hold the completed collage
        await wait(4000);

        // Cinematic zoom out
        collage.style.transition =
            "transform 3s ease, opacity 3s ease";

        collage.style.transform = "scale(0.65)";
        collage.style.opacity = "0.25";

        await wait(3000);

        collageSection.classList.remove("active");
        collageSection.style.display = "none";

        // Final screen
        finalScreen.classList.add("active");

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

        // Fade music out at the end
        fadeOutMusic();
    }

    // =========================================
    // BUTTON EVENTS
    // =========================================

    memoriesBtn.addEventListener("click", startFilm);

    // Replay
    replayBtn.addEventListener("click", async () => {

        filmRunning = false;

        filmStage.innerHTML = "";
        collage.innerHTML = "";

        collage.style.transform = "";
        collage.style.opacity = "";
        collage.style.transition = "";

        collageSection.style.display = "";

        finalScreen.classList.remove("active");
        filmSection.classList.remove("active");
        collageSection.classList.remove("active");

        reveal.style.display = "flex";
        reveal.classList.add("active");

        // Restart music for replay
        if (musicEnabled) {
            stopFade();
            music.pause();
            music.currentTime = 0;
            music.volume = 0;
            await startMusic();
        }

        musicButton.style.display = "block";

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });

    // =========================================
    // CONSOLE
    // =========================================

    console.log("Birthday website loaded!");
    console.log("Photos found:", photos.length);
    console.log("Chapters:", chapters.length);
    console.log("Music:", "/static/music/birthday.mp3");

});
