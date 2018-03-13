#!/usr/bin/python3

'''
Variable derivations:
n = pq
phi = (p-1)(q-1)
e = 1 ~ phi with no common factor to phi
d = ed == 1(mod phi)
c == m^e (mod n)
m == c^d (mod n)
'''

import math
import random
import pickle
import unittest
import time
import os


class RSA:
    def __init__(self, outputDir=None):
        if outputDir is None:
            outputDir = os.path.dirname(os.path.realpath(__file__))

        self.outputDir = outputDir

    def isPrime(self, num):
        '''Simple function to ascertain whether a given integer is a prime number.
        returns True if the number is prime, and False otherwise.'''
        if num == 2:
                return True
        if num < 2 or num % 2 == 0:
                return False
        for n in range(3, int(num**0.5) + 2, 2):
                        if (num % n) == 0:
                                return False
        return True

    def egcd(self, a, b):
        '''Recursive implementation of Euclid's extended algorithm. Expects two integers
        as input and returns a triple (g,x,y) such that ax + by = g = gcd(a,b)'''
        if a == 0:
                return (b, 0, 1)
        else:
                g, x, y = self.egcd(b % a, a)
                return (g, y - (b // a) * x, x)

    def mul_inv(self, e, n):
        '''Makes use of the egcd function to recursively find the modular inverse of e. '''
        g, x, _ = self.egcd(e, n)
        if g == 1:
                return x % n

    def RSA_keygen(self):
        '''Function for generating a new set of RSA keys. Generates two large prime numbers
        and calls mul_inv to generate the decryption key d. Output is stored as pickled tuples
        pubkey and privkey respectively for the public and private components of the key.'''
        primes = [i for i in range(9900000, 10000000) if self.isPrime(i)]

        try:
            p = random.SystemRandom(primes)
        except TypeError:
            p = random.choice(primes)

        primes.remove(p)

        try:
            q = random.SystemRandom(primes)
        except TypeError:
            q = random.choice(primes)

        n = p * q
        e = 65537
        # phi is euler's totient - the count of positive integers up to n that are coprime to n.
        phi = (p-1)*(q-1)
        # lambda is derived from phi as phi / gcd((p-1)(q-1))
        lam = int(phi / math.gcd((p-1), (q-1)))
        d = self.mul_inv(e, lam)

        pubkey = (n, e)
        privkey = (n, d)

        with open(self.outputDir + "/public.b", "wb") as f:
                pickle.dump(pubkey, f)

        with open(self.outputDir + "/private.b", "wb") as f:
                pickle.dump(privkey, f)

        return None

    def RSA_encode(self, message, keyLocation):
        '''Encodes a message using RSA public key cryptography. Output is stored as a pickled list in the
        file message.b for later usage.'''
        with open(keyLocation, "rb") as f:
                key_tup = pickle.load(f)

        n, e = key_tup

        code = [pow(ord(i), e, n) for i in message]
        with open("message.b", "wb") as f:
                pickle.dump(code, f)

        return None

    def RSA_decode(self, message, keyLocation):
        '''Decodes a message encrypted using RSA. Output is returned as a string containing the plaintext
        message.'''
        with open(keyLocation, "rb") as f:
                key_tup = pickle.load(f)

        n, d = key_tup

        with open(message, "rb") as f:
                code = pickle.load(f)

        plaintext_list = [chr(pow(i, d, n)) for i in code]
        plaintext = ''.join(plaintext_list)
        return plaintext

    def parse_txt(self, file):
        with open(file, "r") as f:
                string = f.read()

        return string


class RSA_tests(unittest.TestCase):
    def setUp(self):
        self.rsa = RSA()
        self._started_at = time.time()

    def tearDown(self):
        elapsed = time.time() - self._started_at
        print('{} ({}s'.format(self.id(), elapsed))

    def test_1(self):
        self.rsa.RSA_keygen()

    def test_2(self):
        print('Essay encode test running... ')
        self.rsa.RSA_encode(self.rsa.parse_txt('test_essay.txt'), 'public.b')

    def test_3(self):
        print('Essay decode test running... ')
        self.rsa.RSA_decode('message.b', 'private.b')


if __name__ == '__main__':
    unittest.main()
