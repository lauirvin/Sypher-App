#!/usr/bin/python3

import argparse
from RSA import RSA


def command_line():
    '''Command line wrapper for RSA.py.'''
    parser = argparse.ArgumentParser(description='Command line interface for RSA encryption')
    parser.add_argument('-n', '--new-keys', action='store_true', help='Whether or not new keys should be generated.')
    parser.add_argument('-m', '--message', action='store', type=str, help='Message to be encoded.')
    parser.add_argument('-f', '--file', action='store', type=str, help='File to be encoded.')
    parser.add_argument('-o', '--output-location', action='store', type=str, help='Output location for the encoded message file')
    parser.add_argument('-c', '--coded-message', action='store', type=str, help='Location of message to be decoded.')
    parser.add_argument('-k', '--key-files', action='store', type=str, help='Location of the key files')
    parser.add_argument('-s', '--store-keys', action='store', type=str, help='Desired file location for output of keys')
    arguments = parser.parse_args()

    rsa = RSA(arguments.store_keys, arguments.output_location)

    if arguments.message and arguments.file:
        print("You can't both encode a file and a message at the same time")
        exit(1)

    if arguments.new_keys:
        rsa.RSA_keygen()

    if not arguments.key_files:
        if arguments.message or arguments.file:
            arguments.key_files = 'public.b'
        else:
            arguments.key_files = 'private.b'

    if arguments.file:
        with open(arguments.file) as file:
            rsa.RSA_encode(file.read(), arguments.key_files)
            exit(0)

    if arguments.message:
        rsa.RSA_encode(arguments.message, arguments.key_files)
        exit(0)

    if arguments.coded_message:
        message = rsa.RSA_decode(arguments.coded_message, arguments.key_files)
        print(message)


if __name__ == '__main__':
    command_line()
