"""
Module for the LPAgent class that can be subclassed by agents.
@Author:  <samiramaghool@gmail.com>
"""
from SimPy import Simulation as Sim
import random


class LPAgent(Sim.Process):
    #class variables, shared between all instances of this class
    SEED = 9154853443   
    r = random.Random(SEED)
    TIMESTEP_DEFAULT = 1.0

    def __init__(self, initialiser, name='network_process'):   
        Sim.Process.__init__(self, name)
        self.initialize(*initialiser)
        
    def initialize(self, id, sim, LPNet):             
        """
        This method gets called automatically
        """

        self.id = id
        self.sim = sim
        self.LPNet = LPNet
        self.VL = {l: LPNet.nodes[self.id][l] for l in sim.getLabels()}
        self.terminationVarianceStreak = 0
        self.step = 0

    def getTerminationVarianceStreak(self):
        return self.terminationVarianceStreak

    def allAgentsAreStationary(self):
        return all([a.getTerminationVarianceStreak() >= 3 for a in self.getAllAgents()])

    def updateTerminationVarianceStreak(self):
        difSum = [abs(self.VL[i] - self.LPNet.nodes[self.id][i]) \
                  for i in self.sim.getLabels()]
        mean = sum(difSum) / len(difSum)

        if mean < self.sim.getNegligiblyThreshold():
            self.terminationVarianceStreak += 1

            if self.terminationVarianceStreak >= 3:
                if self.allAgentsAreStationary():
                    self.sim.updateTerminationStep(self.step + 1)
        else:
            self.terminationVarianceStreak = 0

    def getAllNodes(self):
        return self.LPNet.nodes()

    def getAllAgents(self):
        # Get all nodes in the network
        all_nodes = self.getAllNodes()
        return [self.LPNet.nodes[n]['agent'] for n in all_nodes] 

    def getNeighbouringAgents(self):
        if self.sim.isDirected():
            if self.sim.isPropagationFromPredecessors():
                neighs = self.LPNet.predecessors(self.id)
            else:
                neighs = self.LPNet.successors(self.id)
        else:
            neighs = self.LPNet.neighbors(self.id)
        return [self.LPNet.nodes[n]['agent'] for n in neighs]
    
    def getNeighbouringAgentsIter(self):
        if self.sim.isDirected():
            if self.sim.isPropagationFromPredecessors():
                neighs = self.LPNet.predecessors(self.id)
            else:
                neighs = self.LPNet.successors(self.id)
        else:
            neighs = self.LPNet.neighbors(self.id)
        return (self.LPNet.nodes[n]['agent'] for n in neighs)
   
    def getAgent(self, id):  
        return self.LPNet.nodes[id]['agent']    

    def Run(self):
        """
        Start the agent execution
        it executes a state change then wait for the next step
        """

        while True:
            # first move new state into the current one
            self.updateStep()
            
            # update the streak of timesteps where
            #   the vl remained within the negligibly threshold
            
            # hold until all the other agents have 
            #   updated their VL values
            yield Sim.hold, self, LPAgent.TIMESTEP_DEFAULT/2

            # calculate the new VL values for the node
            self.state_changing()

            # update the number of timesteps for which
            #   this agent is in termination state
            # if one agent is in termination mode, it also checks if the other
            #   agents are in termination mode
            self.updateTerminationVarianceStreak()
            self.step += 1

            # Hold until all the other agents have calculated
            #   the new VL values
            yield Sim.hold, self, LPAgent.TIMESTEP_DEFAULT/2
           

    def state_changing(self):
        """
        Updates the VL values of the node by using the Update Rule.
        """
        print(str(self.step) + "/" + str(self.sim.until))

        if self.sim.isDirected():
            if self.sim.isPropagationFromPredecessors():
                neighbours = list(self.LPNet.predecessors(self.id))
            else:
                neighbours = list(self.LPNet.successors(self.id))
        else:
            neighbours = list(self.LPNet.neighbors(self.id))

        w1 = self.sim.getWeights()[self.id][0]
        w2 = self.sim.getWeights()[self.id][1]

        for j in self.sim.getLabels():
            # ssum  = 0
            ssumf = 0

            # Calculate the second term of the update rule
            for i in list(neighbours):
                # ssum += float(self.LPNet.nodes[i][j]) / float(neighboursSize+1)
                ssumf += float(self.LPNet.nodes[i][j]) * w2

            # Update label j belonging coefficient
            # self.VL[j] = float(self.LPNet.nodes[self.id][j]) / float(neighboursSize + 1) + ssum
            self.VL[j] = ssumf + (float(self.LPNet.nodes[self.id][j]) * w1)

    def updateStep(self):
        """
        Update the current VL values of node to the one calculated before.
        """

        for j in self.sim.getLabels():
            self.LPNet.nodes[self.id][j] = self.VL[j]               