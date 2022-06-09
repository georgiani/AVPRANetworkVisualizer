'''Author: samiramaghool@gmail.com'''
from flask import session
from networkx.readwrite import json_graph as jg
from sympy import Float, Symbol
from sympy.parsing.latex import parse_latex
from LPA.network_logger import NetworkLogger
from SimPy import Simulation as Sim
import LPA.lpagent as LPAgent
 
def run_simulation_on_network_from_files(lp_net,
                              max_simulation_time, 
                              trials,
                              dir,
                              custom=False,
                              negThr = 0.1,
                              directed=True,
                              fromPredecessors=True):

    # make a simulation and then start it
    print("Called run sim")
    simulation = NetworkSimulation(
                    lp_net = lp_net, 
                    LPAgent = LPAgent, 
                    max_time = max_simulation_time, 
                    negligiblyThr = negThr, 
                    trials = trials, 
                    custom = custom, 
                    dir = dir,
                    directed=directed,
                    fromPredecessors=fromPredecessors) 
    print("Defined simulation")
    simulation.runSimulation()

    lp_net.graph['finalTs'] = simulation.getTerminationStep()

    # return the network in its most recent state (last time step)
    return lp_net.graph

class NetworkSimulation(Sim.Simulation):
    """
    Simulation support for agents in a complex network.
    Can run multiple fresh trials with the same input parameters. Writes system
    state evolution to file (states & network topologies)
    """
 
    def __init__(self, lp_net, LPAgent, max_time, negligiblyThr, trials=1, custom=False, dir = "results/", directed=True, fromPredecessors=True):
        Sim.Simulation.__init__(self)
        self.LPNet = lp_net
        self.LPAgent = LPAgent
        self.until = max_time 
        self.negligiblyThreshold = negligiblyThr
        self.trials = trials
        self.dir = dir
        self.terminationStep = max_time
        self.updateWeights = {}
        self.directed = directed
        self.fromPredecessors = fromPredecessors

        # weights init
        if custom and ("formula" in session):
            k = Symbol('k')
            w2 = parse_latex(session["formula"])
            w1 = (1 - k * w2)
            
            # sympy Float is slow, so casting it to a python
            #   float will make the calculations easier
            if self.directed:
                if self.fromPredecessors:
                    self.updateWeights = {
                        node : (float(Float(w1.subs(k, len(list(self.LPNet.predecessors(node)))), 16)), 
                                float(Float(w2.subs(k, len(list(self.LPNet.predecessors(node)))), 16)))
                        for node in self.LPNet.nodes
                    }
                else:
                    self.updateWeights = {
                        node : (float(Float(w1.subs(k, len(list(self.LPNet.successors(node)))), 16)), 
                                float(Float(w2.subs(k, len(list(self.LPNet.successors(node)))), 16)))
                        for node in self.LPNet.nodes
                    }
            else:
                self.updateWeights = {
                    node : (float(Float(w1.subs(k, len(list(self.LPNet.neighbors(node)))), 16)), 
                            float(Float(w2.subs(k, len(list(self.LPNet.neighbors(node)))), 16)))
                    for node in self.LPNet.nodes
                }

        else:
            if self.directed:
                if self.fromPredecessors:
                    self.updateWeights = {
                        node : (1/(len(list(self.LPNet.predecessors(node))) + 1), 
                                1/(len(list(self.LPNet.predecessors(node))) + 1)) 
                        for node in self.LPNet.nodes
                    }
                else:
                    self.updateWeights = {
                        node : (1/(len(list(self.LPNet.successors(node))) + 1), 
                                1/(len(list(self.LPNet.successors(node))) + 1)) 
                        for node in self.LPNet.nodes
                    }
            else:
                self.updateWeights = {
                    node : (1/(len(list(self.LPNet.neighbors(node))) + 1), 
                            1/(len(list(self.LPNet.neighbors(node))) + 1)) 
                    for node in self.LPNet.nodes
                }

    def getNegligiblyThreshold(self):
        return self.negligiblyThreshold

    def isDirected(self):
        return self.directed

    def isPropagationFromPredecessors(self):
        return self.fromPredecessors

    def getWeights(self):
        return self.updateWeights

    def getLabels(self):
        return self.LPNet.graph['labels']

    def getTerminationStep(self):
        return self.terminationStep

    def updateTerminationStep(self, step):
        self.terminationStep = min(self.terminationStep, step)

    def runSimulation(self):
        print ("Starting simulation...")    

        for i in range(self.trials):
            print ("---Trial " + str(i) + " ---")
            self.runTrial(i)
            
        print ("Simulation completed. ")
      
    def runTrial(self, id):   
        self.initialize()
                      
        print ("set up LP agents...")              

        # Initialize agents in every node
        for i in self.LPNet.nodes():
            agent = self.LPAgent.LPAgent((i, self, self.LPNet))
            self.LPNet.nodes[i]['agent'] = agent
            self.activate(agent, agent.Run())


        # Set up logging for this trial
        print ("set up logging...")
        logger = NetworkLogger(self, 1, self.until)
        # activate the passive process inside the simulation
        self.activate(logger, logger.Run(), prior=True)
        
        # Run simulation
        self.simulate(self.until)

        # Logs the trial id
        logger.logTrialToFiles(self.dir, id)