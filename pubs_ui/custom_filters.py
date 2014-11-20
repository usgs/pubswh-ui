'''
Created on Nov 10, 2014

@author: ayan
'''


def display_publication_info(json_content):
    publication_year = json_content.get('publicationYear', None)
    series_title_value = json_content.get('seriesTitle', None)
    series_number_value = json_content.get('seriesNumber', None)
    series_title_dict = json_content.get('seriesTitle', None)
    try:
        series_title_text = series_title_dict.get('text', None)
    except AttributeError:
        series_title_text = None
    publication_type_dict = json_content.get('publicationType', None)
    try:
        publication_type_text = publication_type_dict.get('text', None)
    except AttributeError:
        publication_type_text = None
    if series_title_value and series_number_value:
        series_number = series_number_value
        chapter = json_content.get('chapter', None)
        subchapter = json_content.get('subChapter', None)
        if chapter and subchapter:
            pub_info = '{publication_year}, {title} {series_number} {chapter} {subchapter}'.format(publication_year=publication_year,
                                                                                                   title=series_title_text,
                                                                                                   series_number=series_number,
                                                                                                   chapter=chapter,
                                                                                                   subchapter=subchapter
                                                                                                   )
        elif chapter and not subchapter:
            pub_info = '{publication_year}, {title} {series_number} {chapter}'.format(publication_year=publication_year,
                                                                                      title=series_title_text,
                                                                                      series_number=series_number,
                                                                                      chapter=chapter
                                                                                      )
        else:
            pub_info = '{publication_year}, {title} {series_number}'.format(publication_year=publication_year,
                                                                            title=series_title_text,
                                                                            series_number=series_number
                                                                            )
        full_pub_info = pub_info           
    elif series_title_value and publication_type_text == 'Article':
        start_page = json_content.get('startPage', None)
        end_page = json_content.get('endPage', None)
        try:
            volume = json_content['volume']
            pub_info = '{publication_year}, {title} ({volume})'.format(publication_year=publication_year,
                                                                                    title=series_title_text,
                                                                                    volume=volume
                                                                                    )
        except KeyError:
            volume = None
            pub_info = '{publication_year}, {title}'.format(publication_year=publication_year,
                                                            title=series_title_text
                                                            )
        if start_page:
            pub_info = '{pub_info} {start_page}'.format(pub_info=pub_info, start_page=start_page)
        else:
            pub_info = pub_info
            
        if end_page:
            full_pub_info = '{pub_info}-{end_page}'.format(pub_info=pub_info, end_page=end_page)
        else:
            full_pub_info = pub_info
    else:
        if publication_type_text:
            pub_info ='{publication_year}, {publication_type}'.format(publication_year=publication_year,
                                                                      publication_type = publication_type_text
                                                                      )
        else:
            pub_info = '{publication_year}'.format(publication_year=publication_year)
        if json_content.get('largerWorkTitle', None):
            full_pub_info = '{pub_info}, {larger_work_title}'.format(
                                                                     pub_info=pub_info,
                                                                     larger_work_title=json_content.get('largerWorkTitle', None)
                                                                     )
        else:
            full_pub_info = pub_info    
    return full_pub_info
