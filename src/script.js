const fs = require('fs');
const ytdl = require('ytdl-core');
const readline = require("readline");

const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path
const ffmpeg = require('fluent-ffmpeg')

const readLine = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function main(url, startTime, endTime) {

  const duration = getDifferenceInSeconds(startTime, endTime);

  console.log('Iniciando download do video')
  ytdl(url, { filter: 'audioandvideo', quality: 'highestvideo' })
    .pipe(fs.createWriteStream('./origins/video.mp4')).on("finish", function () {
      ffmpeg.setFfmpegPath(ffmpegPath)

      ffmpeg('./origins/video.mp4')
        .setStartTime(startTime)
        .setDuration(String(duration))
        .output('./out/video_out.mp4')
        .on('end', function (err) {
          if (!err) {
            console.log('conversion Done')
            process.exit(1)
          }
        })
        .on('error', err => console.log('error: ', err))
        .run()
    });
}

function getDifferenceInSeconds(startTime, endTime) {
  const endTimeInSeconds = getTimeInSeconds(endTime)
  const startTimeInSeconds = getTimeInSeconds(startTime)

  return endTimeInSeconds - startTimeInSeconds
}

function getTimeInSeconds(time) {
  let timeSplitted = time.split(':')

  const timeInSeconds = (Number(timeSplitted[0]) * 60 * 60) +
    (Number(timeSplitted[1]) * 60) +
    Number(timeSplitted[2])

  return timeInSeconds
}

(async () => {
  try {
    const url = await new Promise((resolve) => {
      readLine.question("Informe o video que irá ser baixado:  ", resolve);
    });

    const startTime = await new Promise((resolve) => {
      readLine.question("Informe o tempo inicial do corte (00:00:00): ", resolve);
    });

    const endTime = await new Promise((resolve) => {
      readLine.question("Informe o tempo final do corte (00:00:00): ", resolve);
    });

    main(url, startTime, endTime);
  } catch (error) {
    console.error(error);
  }
})();