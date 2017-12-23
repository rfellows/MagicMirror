var NodeHelper = require('node_helper');
var request = require('request')
var cheerio = require('cheerio')
var _ = require('lodash')

module.exports = NodeHelper.create({
  start: function() {
		console.log('Starting module: ' + this.name)
	},

	// Subclass socketNotificationReceived received.
	socketNotificationReceived: function(notification, payload) {
		if (notification === 'GET_GRADES') {
			this.getGrades(payload.config)
		}
	},

  getGrades: function(config) {
    const site = {
      base: config.baseUrl,
      login: 'index.php',
      modules: 'Modules.php?modname=misc/Portal.php',
      getLoginUrl: () => {
        return site.base + site.login
      },
      getModulesUrl: () => {
        return site.base + site.modules
      }
    }
    const loginRequest = {
      url: site.getLoginUrl(),
      form: {
        data: 'username=' + config.username + '&password=' + config.password,
        login: 'true'
      }
    }

    request = request.defaults({jar: true})

    // console.log('Logging in...')
    request.post(loginRequest, (error, response, body) => {
      if (error) {
        console.error('Error logging in to ' + loginUrl)
      } else {
        // console.log('Log in success!')

        request.get(site.getModulesUrl(), (error, response, body) => {
          if (_.isNil(error)) {
            const $ = cheerio.load(body)

            // get all of the rows of the table that has the grades
            let gradeRows = $('.portal_block_Featured.Programs table.BoxContents tr')

            // filter out all rows that don't have 11 <td>'s
            let classRows = gradeRows.has('td:nth-child(11)')

            let classData = []
            classRows.map((i, el) => {
              const n = $(el)
              const cells = n.children()
              let period = parseInt($(cells.get(3)).text().match(/\d+/)[0])
              let letterGrade = $(cells.get(7)).text().match(/[ABCDF]/)[0]
              let percentGrade = $(cells.get(7)).text().match(/\d+[%]/)[0]
              let teacher = _.trim($(cells.get(4)).text()).split(' ')
              let c = {
                period: period,
                subject: _.trim($(cells.get(2)).text()).replace('M/J ', ''),
                letterGrade: letterGrade,
                percentGrade: percentGrade,
                teacher: _.capitalize(teacher[teacher.length - 1])
              }
              classData.push(c)
            })
            this.sendSocketNotification('GRADES', classData);
            // return classData
          } else {
            console.error('Error getting grades', error)
          }
        })
      }
    })
  },

  /* broadcastGrades()
	 * Creates an object with all grades and broadcasts these using sendSocketNotification.
	 */
	broadcastGrades: function(grades) {
    console.log('Broadcasting grades');
		this.sendSocketNotification('GRADES', grades);
	}
});
