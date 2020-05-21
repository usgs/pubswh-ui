"""
Tools for transforming xml pubs
"""
# pylint: disable=C0103,C0302

from bs4 import BeautifulSoup


def transform_xml_full(html, images_path):
    """
    transform xml full documents to use usgs publications styling
    :return: newly styled html
    """
    soup = BeautifulSoup(html, 'lxml')
    body = soup.new_tag('body')

    for content_div in soup.findAll('div', {'class': ['book-part', 'back-section', 'section']}):
        body.append(content_div)

    ref_list = body.find('div', {'class': 'ref-list table'})
    citation_table = get_citation_table(soup, ref_list)
    ref_list.insert_after(citation_table)
    ref_list.extract()

    for fig in body.findAll('div', 'fig panel'):
        get_figure(soup, fig, images_path)

    for formula in body.findAll('div', 'disp-formula'):
        formula.img.extract()

    for table in body.findAll('table'):
        get_table(table)

    for list_div in body.findAll('div', {'class': 'list'}):
        get_list(list_div)

    for main_title in body.findAll('h2', {'class': 'main-title'}):
        get_main_title(main_title)

    for section_title in body.findAll('h3', {'class': 'section-title'}):
        get_section_title(section_title)

    for title in body.findAll('h3', {'class': 'title'}):
        get_title(title)

    for a in body.findAll('a'):
        get_a_tag(a)

    return body


def get_citation_table(soup, references):
    """
    Creates a citation table given a list of references cited
    :return: a citation table
    """
    citation_table = soup.new_tag('table')
    citation_table['id'] = 'references-cited'

    for ref_list_row in references.findAll('div', 'row'):
        row = soup.new_tag('tr')
        citation_table.append(row)

        ref_label = ref_list_row.find('div', 'ref-label cell')
        label = ref_label.find('span', 'generated')
        del label['class']
        row.append(soup.new_tag('td'))
        row.td.append(label)
        row.td.append(ref_label.find('a'))

        p = ref_list_row.find('div', 'ref-content cell').find('p')
        del p['class']
        row.append(soup.new_tag('td'))
        row.td.next_sibling.append(p)

    return citation_table


def get_figure(soup, fig, images_path):
    """
    Creates and inserts a new figure element, and removes the old fig panel div
    :param soup: a BeautifulSoup transformation object
    :param fig: an html element containing an image and caption
    """
    figure = soup.new_tag('figure')

    figure.append(soup.new_tag('a'))
    figure.a['id'] = fig.find('a')['id']
    (fig.find('a')['id'])

    figure.append(soup.new_tag('h5'))
    figure.h5.append(fig.find('h5').text)

    figure.append(soup.new_tag('img'))
    #figure.img['src'] = fig.find('img')['src']
    figure.img['src'] = images_path+fig.find('a')['id']+".png"
    figure.append(soup.new_tag('figcaption'))
    #figure.figcaption.append(fig.find('b'))

    p_first = fig.find('p', {'class': 'first'})
    figure.figcaption.append(" " + p_first.text)
    figure.figcaption['id'] = p_first['id']
    p_first.extract()

    if fig.find('div', {'class': 'long-desc'}) is not None:
        p = fig.find('div', {'class': 'long-desc'})
        figure.img['alt'] = p.text

    fig_id = fig.find('a')['id']
    figure.img['id'] = fig_id

    fig.insert_after(figure)
    fig.extract()


def get_table(table):
    """
    Updates table styling
    :param table: an html table
    :return: the newly styled table
    """
    table['class'] = "usa-table"

    return table


def get_list(list_div):
    """
    Updates list styling
    :param list_div: an html div.list
    :return: the newly styled list
    """
    list_div['class'] = 'usa-list'

    return list_div


def get_section_title(section_title):
    """
    Updates section-title styling
    :param section_title: an html element with section-title styling
    :return: the newly styled element
    """
    section_title['class'] = 'series-title'

    return section_title


def get_title(title):
    """
    Updates title styling
    :param title: an html element with title styling
    :return: the newly styled element
    """
    title['class'] = 'subseries-title'

    return title


def get_a_tag(a):
    """
    Updates link styling
    :param a: an html a element
    :return: the newly styled a element
    """
    a['class'] = 'usa-link'

    return a


def get_main_title(main_title):
    """
    Updates main-title styling
    :param main_title: an html element with main-title styling
    :return: the newly styled element
    """
    main_title['class'] = 'publication-title'

    return main_title
