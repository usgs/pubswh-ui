"""
Tools for transforming xml pubs
"""
# pylint: disable=C0103,C0302

from bs4 import BeautifulSoup


def transform_xml_full(html, image_url):
    """
    pull page data from publication/<indexId>/pubs-services endpoint
    :return: the html of the page itself, stripped of header and footer
    """

    # Make a soup
    soup = BeautifulSoup(html, 'lxml')

    body = soup.new_tag('body')

    # Grab all content blocks we want from the input html
    for content_div in soup.findAll('div', {'class': ['book-part', 'back-section', 'section']}):
        body.append(content_div)

    # Make a new citation table and add content we want from the ref-list div
    ref_list = body.find('div', {'class': 'ref-list table'})
    citation_table = get_citation_table(soup, ref_list)

    # append the citation table to the body and delete the now obsolete ref-list div
    ref_list.insert_after(citation_table)
    ref_list.extract()

    # Make a new figure, add content we want from the fig panel, then delete the fig panel
    for fig in body.findAll('div', 'fig panel'):
        get_figure(soup, fig, image_url)

    # add usa-table styling to all tables
    for table in body.findAll('table'):
        get_table(table)

    # add usa-list styling to all div.lists
    for list_div in body.findAll('div', {'class': 'list'}):
        get_list(list_div)

    # add publication-title styling to h2.main-title
    main_title = body.find('h2', {'class': 'main-title'})
    main_title['class'] = 'publication-title'

    # add series-title styling to all h3.section-titles
    for section_title in body.findAll('h3', {'class': 'section-title'}):
        section_title['class'] = 'series-title'

    # add subseries-title styling to all h3.titles
    for title in body.findAll('h3', {'class': 'title'}):
        title['class'] = 'subseries-title'

    # add usa-link styling to all a tags
    for a in body.findAll('a'):
        a['class'] = 'usa-link'

    return body


def get_citation_table(soup, references):
    """
    Creates a citation table given a list of references cited
    :return: a citation table
    """
    citation_table = soup.new_tag('table')
    citation_table['id'] = 'references-cited'

    for ref_list_row in references.findAll('div', 'row'):
        # add a new row to the citation table
        row = soup.new_tag('tr')
        citation_table.append(row)

        # add a data cell for ref-label content
        label_td = soup.new_tag('td')
        row.append(label_td)
        ref_label = ref_list_row.find('div', 'ref-label cell')
        label = ref_label.find('span', 'generated')
        del label['class']
        label_td.append(label)
        label_td.append(ref_label.find('a'))

        # add a data cell for ref-content content
        content_td = soup.new_tag('td')
        row.append(content_td)
        ref_content = ref_list_row.find('div', 'ref-content cell')
        content = ref_content.find('p')
        del content['class']
        content_td.append(content)

    return citation_table


def get_figure(soup, fig, image_url):
    # create a new figure
    figure = soup.new_tag('figure')

    # add an "a" tag
    a = soup.new_tag('a')
    figure.append(a)
    a['id'] = fig.find('a')['id']

    # add an h5
    h5 = soup.new_tag('h5')
    figure.append(h5)
    h5.append(fig.find('h5').text)

    # add an img tag to the figure
    img = soup.new_tag('img')
    figure.append(img)

    # construct the img url
    img['src'] = image_url + fig.find('img')['src'] + '.png'

    # add a figcaption
    fig_caption = soup.new_tag('figcaption')
    figure.append(fig_caption)

    # add the b tag, and the p.first id and text to the figcaption
    fig_caption.append(fig.find('b'))

    p_first = fig.find('p', {'class': 'first'})
    fig_caption.append(" " + p_first.text)
    fig_caption['id'] = p_first['id']

    p_first.extract()

    # add the only remaining div.caption paragraph content to the img
    p = fig.find('p')
    img['alt'] = p.text
    img['id'] = p['id']

    # insert the newly built figure after the existing fig panel, then delete the now obsolete fig panel
    fig.insert_after(figure)
    fig.extract()


def get_table(table):
    table['class'] = "usa-table"

    return table


def get_list(list_div):
    list_div['class'] = 'usa-list'

    return list_div
