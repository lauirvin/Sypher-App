import argparse

from RSAtest import *

def command_line():
    parser = argparse.ArgumentParser(description='Command line interface for RSA encryption')
    parser.add_argument('-n','--new-keys', action='store', type=bool, help='Whether or not new keys should be generated. MANDATORY.')
    parser.add_argument('-m','--message', action='store', type=str, help='Message to be encoded.')
    parser.add_argument('-c','--coded-message', action='store', type=str, help='Location of message to be decoded.')    
    arguments = parser.parse_args()

    if arguments.new_keys == None:
        raise ValueError('You must specify whether or not new keys are required.')

    if arguments.new_keys:
        RSA_keygen()

    if arguments.message:
        coded = RSA_encode(arguments.message,"keys.txt")     

    if arguments.coded_message:
        message = RSA_decode(arguments.coded_message,"keys.txt")
        print (message)
                                                                                   
if __name__ == '__main__':
    command_line()
