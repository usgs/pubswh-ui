'''
Created on Nov 12, 2014

@author: ayan
'''
import string
import random
from werkzeug.routing import _get_environ

def str_lower(lettuce_str):
    
    new_str = lettuce_str.lower().replace(' ', '_')
    
    return new_str


def id_generator(size=60):
    uppercase = string.ascii_uppercase
    lowercase = string.ascii_lowercase
    digits = string.digits
    
    characters = uppercase + lowercase + digits
    
    key_string = ''.join(random.choice(characters) for _ in range(size))
    
    return key_string


if __name__ == '__main__':
    
    key_string = id_generator()
    print(key_string)