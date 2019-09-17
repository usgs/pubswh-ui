"""
Tests for xml_transformations transformation tools
"""
import unittest
from bs4 import BeautifulSoup
from ..xml_transformations import transform_xml_full, get_citation_table
from ... import app


class TransformXMLFullTestCase(unittest.TestCase):
    """
    Tests for transform_xml_full
    """

    def test_does_the_transform_produce_html_publication_with_usgs_styling(self):
        with open("pubs_ui/pubswh/tests/data/transformed_output.html") as sample_output:
            transformed_html = sample_output.read()

        # need to extract the body from the html tag, which soup adds by default
        soup = BeautifulSoup(transformed_html, 'lxml')
        expected_string = str(soup.find('body'))
        expected_no_whitespace = "".join(expected_string.split())

        actual_string = str(transform_xml_full(app.config['HTML_ENDPOINT'], app.config['SPN_IMAGE_URL']))
        actual_no_whitespace = "".join(actual_string.split())

        # string comparison of the soup output with all whitespace removed
        self.assertEqual(actual_no_whitespace, expected_no_whitespace)

    def test_does_the_transform_produce_a_citation_table(self):
        sample_ref_list_table = """
            <div class="ref-list table">
                <div class="row">
                   <div class="ref-label cell">
                      <p class="ref-label"><span class="label"><span class="generated">1</span></span>&nbsp;<a id="r1">
                            <!-- named anchor --></a></p>
                   </div>
                   <div class="ref-content cell">
                      <p class="citation"><a id="d5e3431">
                            <!-- named anchor --></a>Bechtel Nevada, 2004, Completion report for well cluster ER-6-1: U.S. Department of
                         Energy Report DOE/NV/11718-862, 134 p.
                      </p>
                   </div>
                </div>
                <div class="row">
                   <div class="ref-label cell">
                      <p class="ref-label"><span class="label"><span class="generated">2</span></span>&nbsp;<a id="r2">
                            <!-- named anchor --></a></p>
                   </div>
                   <div class="ref-content cell">
                      <p class="citation"><a id="d5e3434">
                            <!-- named anchor --></a>Bechtel Nevada, 2006, A hydrostratigraphic model and alternatives for the groundwater
                         flow and contaminant transport model of Corrective Action Unit 97—Yucca Flat–Climax
                         Mine, Lincoln and Nye Counties, Nevada: U.S. Department of Energy Report DOE/NV/11718-1119,
                         288 p.
                      </p>
                   </div>
                </div>
            </div>
        """

        expected_citation_table_string = """
            <table id="references-cited">
                <tr>
                    <td>
                        <span>1</span>
                        <a id="r1"><!-- named anchor --></a>
                    </td>
                    <td>
                        <p>
                            <a id="d5e3431"><!-- named anchor --></a>
                            Bechtel Nevada, 2004, Completion report for well cluster ER-6-1: U.S. Department of
                            Energy Report DOE/NV/11718-862, 134 p.
                        </p>
                    </td>
                </tr>
                <tr>
                    <td>
                        <span>2</span>
                        <a id="r2"><!-- named anchor --></a>
                    </td>
                    <td>
                        <p>
                            <a id="d5e3434"><!-- named anchor --></a>
                            Bechtel Nevada, 2006, A hydrostratigraphic model and alternatives for the groundwater
                            flow and contaminant transport model of Corrective Action Unit 97—Yucca Flat–Climax
                            Mine, Lincoln and Nye Counties, Nevada: U.S. Department of Energy Report DOE/NV/11718-1119,
                            288 p.
                        </p>
                    </td>
                </tr>
            </table>
        """

        soup = BeautifulSoup(sample_ref_list_table, 'lxml')
        references = soup.find('div', {"class": "ref-list table"})

        expected_citation_table_string_no_whitespace = "".join(expected_citation_table_string.split())
        actual_citation_table_string_no_whitespace = "".join(str(get_citation_table(soup, references)).split())

        self.assertEqual(expected_citation_table_string_no_whitespace, actual_citation_table_string_no_whitespace)