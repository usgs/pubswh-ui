'''
Created on Oct 27, 2014

@author: ayan
'''
from unittest import TestCase
from ..flask_pagination import manual_paginate_json_response


class TestManualPaginateJsonResponse(TestCase):
    
    """
    Test that manual_paginate_json_response
    is slicing correctly.
    """
    
    def setUp(self):
        self.list_1 = list(range(1, 18))
        self.list_1_len = len(self.list_1)
        self.per_page = 5
        
    def test_page_one_behavior(self):
        result = manual_paginate_json_response(self.list_1, 1, self.list_1_len, self.per_page)
        expected = [1, 2, 3, 4, 5]
        self.assertEqual(result, expected)
        
    def test_page_two_behavior(self):
        result = manual_paginate_json_response(self.list_1, 2, self.list_1_len, self.per_page)
        expected = [6, 7, 8, 9, 10]
        self.assertEqual(result, expected)
        
    def test_page_three_behavior(self):
        result = manual_paginate_json_response(self.list_1, 3, self.list_1_len, self.per_page)
        expected = [11, 12, 13, 14, 15]
        self.assertEqual(result, expected)
        
    def test_page_four_behavior(self):
        result = manual_paginate_json_response(self.list_1, 4, self.list_1_len, self.per_page)
        expected = [16, 17]
        self.assertEqual(result, expected)