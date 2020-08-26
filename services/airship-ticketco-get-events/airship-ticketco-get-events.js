
module.exports = function(RED) {

	var moment  = require('moment');
	const axios = require('../../libs/axios');

    function LowerCaseNode(config) {

        RED.nodes.createNode(this,config);

        this.config = config;

        this.on('input', (msg) => {
        	let days = this.getDaysArray(Number(config.days_behind), Number(config.days_ahead));
        	this.getEvents(msg,config.token, days);
        });


        /**
		 * Outputs success
		 * @param  {[string]} msg [success message]
		 */
        this.showsuccess = (msg,payload) => {
        	msg.payload = payload;
        	this.send([msg,null]);
        };

        /**
		 * Logs an error message
		 * @param  {[string]} msg [error message]
		 */
        this.showerror = (msg,payload) => {
        	msg.payload = payload;
        	this.send([null,msg]);
        };

        /**
		 * Shows a status visual on the node
		 * @param  {[string]} colour [colour of status (green, yellow, red)]
		 * @param  {[string]} shape [shape of symbol]
		 * @param  {[text]} text [text to show]
		 */
        this.showstatus = (colour, shape, text) => {
			this.status({fill:colour,shape:shape,text:text});
        };

		/**
		 * Returns an array of days in YYYY-MM-DD format between two dates
		 * @param  {[Number]} days_behind [the number of days before now to start from]
		 * @param  {[Number]} days_ahead  [the number of days after now to end]
		 * @return {[Array]}             [array of dates]
		 */
        this.getDaysArray = (days_behind, days_ahead)=>{

	    	let today = new Date();
	    	let toReturn = [];

        	let i = -days_behind;

	    	while (i < days_behind-1) {
	    		let newDate = moment().add(i, 'days').format('YYYY-MM-DD');
	    		toReturn.push(newDate);
				i++;
			}

        	i = 0;
	    	while (i < days_ahead) {
	    		let newDate = moment().add(i, 'days').format('YYYY-MM-DD');
	    		toReturn.push(newDate);
				i++;
			}

	    	return toReturn;

        };

        /**
		 * Get events from the ticketco API
		 * @param  {[string]} token [API token]
		 * @param  {[Array]} days  [array of dates to get events for]
		 * @return {[void]}       
		 */

        this.getEvents = (msg,token, days) =>
	    {

			this.showstatus("yellow","dot","Getting data");

	    	let events = {};
			let completed = 0;
			let event_count = 0;

	    	for(let index in days){

		    	axios.get('https://ticketco.events:443/api/public/v1/events?token='+token+'&start_at='+days[index])
				.then( (response) => {


					// handle success
					this.showstatus("yellow","dot","Data retrieved for date "+days[index]);
					event_count = event_count+response.data.events.length;
					events[days[index]] = response.data.events;
				})
				.catch( (error) => {
					this.showstatus("red","dot","API Failure");
					this.showerror(msg,error);
				})
				.finally( () => {


					completed++;
					// if this is the final call, push on the message
					if(completed == days.length){
						this.showstatus("green","dot","Data retrieved");
			            this.showsuccess(msg,{events:events, event_count:event_count});
					}
				});
	    	}

	    }
    }

   

    
    RED.nodes.registerType("TicketCo Get Events",LowerCaseNode);
}