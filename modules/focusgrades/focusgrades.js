/* global Module */

/* Magic Mirror
 * Module: FocusGrades
 *
 * By Rob Fellows
 * MIT Licensed.
 */

Module.register('focusgrades', {

	// Default module config.
	defaults: {
		baseUrl: 'https://osceola.focusschoolsoftware.com/focus/'
	},

  start: function() {
    const self = this
    self.getGrades()
    // go check every hour
    setInterval(() => { self.getGrades() }, 1000 * 60 * 60)
  },

  getGrades: function() {
    this.sendSocketNotification('GET_GRADES', {
      config: this.config
    });
  },

  getStyles: function() {
		return ['focusgrades.css'];
	},

	// Override dom generator.
  getDom: function() {
    const table = document.createElement('div')
    table.className = 'table'
    if (this.grades && this.grades.length > 0) {
      let rows = this.grades.map((grade) => {
        const row = document.createElement('div')
        row.className = 'row'
        let cells = [
          `<div class="cell period">${grade.period}</div>`,
          `<div class="cell subject">${grade.subject}</div>`,
          `<div class="cell teacher">${grade.teacher}</div>`,
          `<div class="cell pct">${grade.percentGrade}</div>`,
          `<div class="cell grade ${grade.letterGrade}">${grade.letterGrade}</div>`,
        ]
        row.innerHTML = cells.join('\n')
        return row
      })

      rows.forEach((r) => {
        table.appendChild(r)
      })
    }
    return table;
  },

  socketNotificationReceived: function(notification, payload) {
		if (notification === 'GRADES') {
      console.log('Got grades')
      this.grades = [...payload]
      this.updateDom(100);
		}
	},

});
