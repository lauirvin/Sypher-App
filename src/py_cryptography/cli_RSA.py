#!/usr/bin/python3

import argparse
from RSA import RSA


def command_line():
    '''Command line wrapper for RSA.py.'''
    parser = argparse.ArgumentParser(description='Command line interface for RSA encryption')
    parser.add_argument('-n', '--new-keys', action='store_true', help='Whether or not new keys should be generated.')
    parser.add_argument('-m', '--message', action='store', type=str, help='Message to be encoded.')
    parser.add_argument('-c', '--coded-message', action='store', type=str, help='Location of message to be decoded.')
    parser.add_argument('-k', '--key-files', action='store', type=str, help='TODO')
    parser.add_argument('-s', '--store-keys', action='store', type=str, help='Desired file location for output of keys')
    arguments = parser.parse_args()

    if arguments.new_keys:
        rsa = RSA(arguments.store_keys)
        rsa.RSA_keygen()

    if arguments.message:
        rsa = RSA(arguments.store_keys)
        rsa.RSA_encode(arguments.message, arguments.key_files)

    if arguments.coded_message:
        rsa = RSA(arguments.store_keys)
        message = rsa.RSA_decode(arguments.coded_message, arguments.key_files)

        print(message)


if __name__ == '__main__':
    command_line()
