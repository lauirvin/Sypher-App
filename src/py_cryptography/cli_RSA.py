import argparse

from RSA import *

def command_line():
    '''Command line wrapper for RSA.py.'''
    parser = argparse.ArgumentParser(description='Command line interface for RSA encryption')
    parser.add_argument('-n','--new-keys', action='store_true', help='Whether or not new keys should be generated.')
    parser.add_argument('-m','--message', action='store', type=str, help='Message to be encoded.')
    parser.add_argument('-c','--coded-message', action='store', type=str, help='Location of message to be decoded.')    
    arguments = parser.parse_args()

    if arguments.new_keys:
        RSA_keygen()

    if arguments.message:
        coded = RSA_encode(arguments.message,"public.b")     

    if arguments.coded_message:
        message = RSA_decode(arguments.coded_message,"private.b")
        print (message)
                                                                                   
if __name__ == '__main__':
    command_line()
