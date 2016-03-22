/*global module exports console */

exports.Task_2 = function( data , done ){
    // after arriving ot "Task 2" we start process 1
    this.getParticipantByName("My First Process", function(err, partnerProcess) {
        partnerProcess.triggerEvent("Start Event 1");
        done(data);
    });
};


exports.End_Event_1 = function( data , done ){
    // after reaching the end of process 1, we send a message
    var messageFlows = this.getOutgoingMessageFlows("End Event 1");
    this.sendMessage(messageFlows[0], {gugus: "blah"});
    done(data);
};
