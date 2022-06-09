#!/usr/bin/python
import sys
from network_simulation import run_simulation_on_network_from_files

def main(): 
    run_simulation_on_network_from_files(sys.argv[0], sys.argv[1], sys.argv[2], 40, 1)

if __name__ == '__main__':
    main()
 
