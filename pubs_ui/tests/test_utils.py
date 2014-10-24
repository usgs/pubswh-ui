'''
Created on Oct 23, 2014

@author: ayan
'''
from unittest import TestCase
from ..utils import summation


class TestSummation(TestCase):
    
    """
    
    """
    
    def setUp(self):
        self.positive_a = 16
        self.positive_b = 20
        self.negative_a = -14
        self.negative_b = -2
        
    def test_positive_number_sum(self):
        result = summation(self.positive_a, self.positive_b)
        self.assertEqual(result, 36)
        
    def test_negative_number_sum(self):
        result = summation(self.negative_a, self.negative_b)
        self.assertEqual(result, -16)
        
    def test_postive_negative_sum(self):
        result = summation(self.negative_a, self.positive_a)
        self.assertEqual(result, 2)