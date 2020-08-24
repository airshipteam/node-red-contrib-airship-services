
module.exports = function(RED) {

	var moment  = require('moment');
	const axios = require('../../libs/axios');

    function LowerCaseNode(config) {

        RED.nodes.createNode(this,config);

        this.config = config;
        this.msg = {};

        this.on('input', (msg) => {
        	this.msg = msg;
        	this.getGrosses(config.token, msg.payload.page, msg.payload.event_id);
        });

		/**
		 * Logs a message for debugging
		 * @param  {[string]} msg [debug message]
		 */
		
        this.log = (msg) => {
        	this.send({payload:{message:msg}});
        };

        /**
		 * Outputs success
		 * @param  {[string]} msg [success message]
		 */
        this.showsuccess = (payload) => {
        	this.msg.payload = payload;
        	this.send([this.msg,null]);
        };

        /**
		 * Logs an error message
		 * @param  {[string]} msg [error message]
		 */
        this.showerror = (payload) => {
        	this.msg.payload = payload;
        	this.send([null,this.msg]);
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

	    	while (i < days_behind) {
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
		 * Get grosses from the ticketco API
		 * @param  {[string]} token [API token]
		 * @param  {[Array]} days  [array of dates to get events for]
		 * @return {[void]}       
		 */

        this.getGrosses = (token, page, event_id) =>
	    {

			this.showstatus("yellow","dot","Getting data");

			let event_count = 0;

	    	axios.get('https://ticketco.events:443/api/public/v1/item_grosses?token='+token+'&event_id='+event_id+'&page='+page)
			.then( (response) => {
				// handle success
				this.showstatus("yellow","dot","Data retrieved");
	            this.showsuccess({item_grosses:response.data.item_grosses});

			})
			.catch( (error) => {
				this.showstatus("red","dot","API Failure");
				this.showerror(error);
			})
			.finally( () => {
				this.showstatus("green","dot","Data retrieved");
			});

	    }
    }

   

    
    RED.nodes.registerType("TicketCo Get Item Grosses",LowerCaseNode);
}