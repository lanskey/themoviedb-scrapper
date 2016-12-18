const callApi = require('./services/callApi')
const dataStream = require('./services/dataStream')
const fs = require('fs')

const { logger, getDate } = require('utils/helpers')


function runtime () {
  // TODO: run callApi multiple times under we reach some limit
  // TODO: validate X-RateLimit-Remaining header and if > 0, run another 'callApi', else wait appropriate amount of time returned by
  // X-RateLimit-Reset header
  // TODO: Prepare a .log file of downloaded movie titles
  // TODO: Attach custom uri keys to limit movies page limit, we should estimate parameters to met max of 1000 page per set(of filters)

  console.log('runtime has begin')
  let counter = 0
  const database = []



  const url = 'http://api.themoviedb.org/3/discover/movie?api_key=9dee05d48efe51f51b15cc63b1fee3f5'
  callApi(url)
    .then((data) => {
      logger.info(`${getDate()} API call has been done`)
      counter += 1
      data.results.forEach(item => database.push(item))
      dataStream.emit('dataDownloaded')
      return data
    })
    .catch(err => logger.error(err))

  dataStream.on('dataDownloaded', function(){
    console.log(counter)
    if (counter === 5) {
      console.log('przerwalem sciaganie na poziomie', counter, 'wezwan')
      var file = fs.createWriteStream('array.json')

      database.forEach(function(v) {
        file.write(JSON.stringify(v))
      })

      file.end()

      return
    }

    callApi(url)
      .then((data) => {
        logger.info(`${getDate()} API call has been done`)
        counter += 1
        data.results.forEach(item => database.push(item))
        dataStream.emit('dataDownloaded')
        return data
      })
      .catch(err => logger.error(err))
  })
}

module.exports = runtime
