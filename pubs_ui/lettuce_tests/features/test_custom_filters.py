'''
Created on Nov 12, 2014

@author: ayan
'''
from lettuce import world, step
from nose.tools import assert_equal
from pubs_ui.custom_filters import display_publication_info


"""
Pubs JSON contains chapter and subchapter
"""
@step
def i_have_json_with_a_chapter_and_subchapter(step):
    world.chapter_subchapter_json = {
                                     'seriesTitle': {'text': 'Das Boot'},
                                     'publicationYear': 2021,
                                     'seriesNumber': 14,
                                     'chapter': 18,
                                     'subChapter': 4
                                     }

@step
def i_create_a_pub_info_string_with_chapter_and_subchapter(step):
    world.result = display_publication_info(world.chapter_subchapter_json)
    world.expected = '2021, Das Boot 14 18 4'
    
@step
def i_should_see_a_string_with_chapter_and_subchapter(step):
    assert_equal(world.result, world.expected)


"""
Pubs JSON contains chapter and no subchapter
"""
@step
def i_have_json_with_a_chapter_and_no_subchapter(step):
    world.chapter_no_subchapter_json = {
                                        'seriesTitle': {'text': 'Das Boot'},
                                        'publicationYear': 2021,
                                        'seriesNumber': 14,
                                        'chapter': 18
                                        }   

@step
def i_create_a_pub_info_string_using_chapter_no_subchapter(step):
    world.result = display_publication_info(world.chapter_no_subchapter_json)
    world.expected = '2021, Das Boot 14 18'
    
@step
def i_should_see_a_string_with_chapter_and_no_subchapter(step):
    assert_equal(world.result, world.expected)
    
    
# Pubs JSON contains publication type with end page with no volume
@step
def i_have_json_with_a_publication_type_and_end_page_and_no_volume(step):
    world.pub_type_end_page_json = {
                                    'publicationYear': 2043,
                                    'seriesTitle': {'text': 'Incan Conquest of the World'},
                                    'publicationType': {'text': 'Article'},
                                    'startPage': 17,
                                    'endPage': 49
                                    }

@step
def i_create_a_pub_info_string_using_the_pub_type_and_end_page_json(step):
    world.result = display_publication_info(world.pub_type_end_page_json)
    world.expected = '2043, Incan Conquest of the World 17-49'
    
@step 
def i_should_see_a_string_without_the_volume_and_with_end_page(step):
    assert_equal(world.result, world.expected)


"""   
Pubs JSON contains publication type, end page, and volume
"""
@step
def i_have_json_using_pub_type_and_end_page_and_volume(step):
    world.pub_type_end_page_vol_json = {
                                        'publicationYear': 2043,
                                        'seriesTitle': {'text': 'Incan Conquest of the World'},
                                        'publicationType': {'text': 'Article'},
                                        'volume': 13,
                                        'startPage': 17,
                                        'endPage': 49                                        
                                        }
    
@step
def i_create_a_pub_info_string_using_pub_type_and_end_page_and_volume(step):
    world.result = display_publication_info(world.pub_type_end_page_vol_json)
    world.expected = '2043, Incan Conquest of the World (13) 17-49'
    
@step
def i_should_see_a_string_with_volume_and_end_page(step):
    assert_equal(world.result, world.expected)
    
    
"""
Pubs JSON does not contain chapter
"""
@step
def i_have_json_that_does_not_have_a_chapter(step):
    world.json_no_chapter = {
                             'seriesTitle': {'text': 'Das Boot'},
                             'publicationYear': 2021,
                             'seriesNumber': 14,                         
                             }
    
@step
def i_create_a_pub_info_string_without_a_chapter(step):
    world.result = display_publication_info(world.json_no_chapter)
    world.expected = '2021, Das Boot 14'
    
@step
def i_should_see_a_string_with_year_and_title_and_series_number(step):
    assert_equal(world.result, world.expected)
    

# Pubs JSON does not contain a seriesTitle
@step
def i_have_json_that_does_not_contain_a_series_title(step):
    world.json_no_series_title = {
                                  'publicationYear': 1651,
                                  'publicationType': {'text': 'Article'},
                                  'volume': 32,
                                  'startPage': 10
                                  }
    
@step
def i_create_a_pub_info_string_without_a_series_title(step):
    world.result = display_publication_info(world.json_no_series_title)
    world.expected = '1651, Article'
    
@step
def i_should_see_a_info_string_with_publication_type(step):
    assert_equal(world.result, world.expected)
    
    
# Pubs JSON does not contain a seriesTitle with larger work
@step
