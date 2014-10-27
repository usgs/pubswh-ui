'''
Created on Oct 27, 2014

@author: ayan
'''
                
                
def manual_paginate_json_response(json_response, page, record_total, per_page=10):
    lower_index = per_page * (page-1)
    intermediate_upper_index = lower_index + per_page
    if intermediate_upper_index > record_total:
        actual_upper_index = record_total + 1
    else:
        actual_upper_index = intermediate_upper_index
    sliced_json = json_response[lower_index:actual_upper_index]
    return sliced_json
    