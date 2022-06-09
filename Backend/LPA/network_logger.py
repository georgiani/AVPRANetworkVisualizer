# Here, you can decide which data is needed to save
# Author: samiramaghool@gmail.com
import networkx as nx
from SimPy import Simulation as Sim
import LPA.utils as utils
from pathlib import Path


class NetworkLogger(Sim.Process):
    def __init__(self, sim, logging_interval, max_time):
        Sim.Process.__init__(self, sim=sim)
        self.sim = sim
        self.interval = logging_interval
        self.tt = [x for x in range(0, max_time)]
        self.LPStatesTuples = []

    def Run(self):
        while True:
            self.logCurrentState()
            yield Sim.hold, self, self.interval # hold until interval ends

    def logCurrentState(self):
        # sort such that node i is in ith position
        LPNodes = sorted(self.sim.LPNet.nodes(data=True), key=lambda x: x[0])

        # ordered
        assert([node[0] for node in LPNodes] == [n for n in range(1, len(LPNodes) + 1)])

        # Actual VL belonging coefficients
        LABELS = [[float(node[1]["agent"].VL[i]) for i in self.sim.getLabels()] for node in LPNodes]

        # Add actual VL value to logs
        if self.sim.now() in self.tt:
            self.LPStatesTuples.append([self.sim.now(), LABELS]) 

    def logTrialToFiles(self, dir, id):  
        utils.storeAllToFile(self.LPStatesTuples, dir, id)
        
 
