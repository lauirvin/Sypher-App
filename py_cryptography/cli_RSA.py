import argparse

from RSAtest import *

def command_line():
    parser = argparse.ArgumentParser(description='Command line interface for RSA encryption')
    parser.add_argument('-m','--message', action='store', type=str, help='Message to be encoded.')
    parser.add_argument('-c','--coded-message', action='store', type=list, help='Message to be decoded.')
    arguments = parser.parse_args()

    if not arguments.message and not arguments.coded_message:
        raise ValueError('No message to encode or decode.')

    
    keys = RSA_keygen(arguments.p,arguments.q)
    print (keys)

    if arguments.message:
        coded = RSA_encode(arguments.message,keys[0][0],keys[0][1])
        print (coded)

    if arguments.coded_message:
        message = RSA_decode(arguments.coded_message,keys[1][0],keys[1][1])
        print (message)
                                                                                   
if __name__ == '__main__':
    command_line()
