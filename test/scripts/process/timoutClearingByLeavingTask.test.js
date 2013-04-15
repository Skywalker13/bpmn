var BPMNProcessDefinition = require('../../../lib/bpmn/processDefinition.js').BPMNProcessDefinition;
var BPMNProcess = require('../../../lib/process.js').BPMNProcess;
var BPMNTask = require("../../../lib/bpmn/tasks.js").BPMNTask;
var BPMNStartEvent = require("../../../lib/bpmn/startEvents.js").BPMNStartEvent;
var BPMNEndEvent = require("../../../lib/bpmn/endEvents.js").BPMNEndEvent;
var BPMNSequenceFlow = require("../../../lib/bpmn/sequenceFlows.js").BPMNSequenceFlow;
var BPMNBoundaryEvent = require("../../../lib/bpmn/boundaryEvents.js").BPMNBoundaryEvent;

exports.testClearBPMNTimeoutByLeavingTask = function(test) {
    var boundaryEvent = new BPMNBoundaryEvent("_7", "MyTimeout", "boundaryEvent", "_3", [], ["_8"]);
    boundaryEvent.isTimerEvent = true;

    /** @type {BPMNProcessDefinition} */
    var processDefinition = new BPMNProcessDefinition("PROCESS_1", "myProcess");
    processDefinition.addFlowObject(new BPMNStartEvent("_2", "MyStart", "startEvent", [], ["_4"]));
    processDefinition.addFlowObject(new BPMNTask("_3", "MyTask", "task", ["_4"], ["_10"]));
    processDefinition.addFlowObject(new BPMNEndEvent("_5", "MyEnd", "endEvent", ["_8"], []));
    processDefinition.addFlowObject(boundaryEvent);
    processDefinition.addFlowObject(new BPMNEndEvent("_9", "MyEnd2", "endEvent", ["_8"], []));
    processDefinition.addSequenceFlow(new BPMNSequenceFlow("_4", null, "sequenceFlow", "_2", "_3"));
    processDefinition.addSequenceFlow(new BPMNSequenceFlow("_8", null, "sequenceFlow", "_7", "_5"));
    processDefinition.addSequenceFlow(new BPMNSequenceFlow("_10", null, "sequenceFlow", "_3", "_9"));

    processDefinition.attachBoundaryEvents();

    var bpmnProcess;

    var handler = {
        "MyStart": function(data, done) {
            var state = this.getState();
            test.deepEqual(state.tokens,
                [
                    {
                        "position": "MyStart"
                    }
                ],
                "testClearBPMNTimeoutByLeavingTask: state at MyStart"
            );
            done(data);
        },
        "MyTask": function(data, done) {
            var state = this.getState();
            test.deepEqual(state.tokens,
                [
                    {
                        "position": "MyTask"
                    }
                ],
                "testClearBPMNTimeoutByLeavingTask: state at MyTask"
            );
            this.data = {myproperty: "blah"};
            done(data);
        },
        "MyTaskDone": function(data, done) {
            var state = this.getState();
            test.deepEqual(state.tokens,
                [
                    {
                        "position": "MyTask"
                    }
                ],
                "testClearBPMNTimeoutByLeavingTask: state at MyTask"
            );
            this.data = {myproperty: "blah"};
            done(data);
        },
        "MyTimeout:getTimeout": function() {
            test.ok(true, "testClearBPMNTimeoutByLeavingTask: getTimout has been called");

            process.nextTick(function() {
                bpmnProcess.taskDone("MyTask");
            });
            return 10000;
        },
        "MyTimeout": function(data, done) {
            test.ok(false, "testClearBPMNTimeoutByLeavingTask: should never be here");
            done(data);
        },
        "MyEnd2": function(data, done) {

            var activeTimers = bpmnProcess.activeTimers;
            test.deepEqual(activeTimers,
                {},
                "testClearBPMNTimeoutByLeavingTask: active timers should be empty"
            );
            var state = this.getState();
            test.deepEqual(state.tokens,
                [
                    {
                        "position": "MyEnd2"
                    }
                ],
                "testClearBPMNTimeoutByLeavingTask: state at MyEnd"
            );
            var history = this.getHistory();
            test.deepEqual(history,
                [
                    "MyStart",
                    "MyTask",
                    "MyEnd2"
                ],
                "testClearBPMNTimeoutByLeavingTask: history at MyEnd"
            );
            done(data);

            test.done();
        }
    };

    bpmnProcess = new BPMNProcess("myFirstProcess", processDefinition, handler);

    bpmnProcess.sendStartEvent("MyStart");

};