"""
Tests for xml_transformations transformation tools
"""
import unittest
from bs4 import BeautifulSoup
from ..xml_transformations import get_citation_table, get_figure, get_table, get_list, \
    get_section_title, get_title, get_a_tag, get_main_title
from ... import app





class GetCitationTableTestCase(unittest.TestCase):
    """
    Tests for get_citation_table
    """
    def test_does_the_transform_produce_a_citation_table(self):
        """Given a references div, is a citation table generated?"""
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


class GetFigureTestCase(unittest.TestCase):
    """
    Tests for get_figure
    """
    def does_the_transform_produce_a_figure(self):
        """Given a fig panel div, is a figure generated?"""
        sample_fig_panel_div = """
            <div class="fig panel" style="display: float; clear: both">
                <a id="fig01"><!-- named anchor --></a>
                <h5 class="label">Figure&nbsp;1</h5>
                <div class="caption">
                    <p class="first" id="d5e645">Location of pumping and observation wells, groundwater discharge area, physiographic
                        features, and groundwater basins surrounding the Ash Meadows groundwater basin, Nevada
                        and California.
                    </p>
                    <p id="d5e647">
                        <b>Figure 1.</b> 
                        Map showing location of pumping and observation wells, groundwater discharge area,
                        physiographic features, and groundwater basins surrounding the Ash Meadows groundwater
                        basin, Nevada and California.
                    </p>
                </div>
                <img alt="sac19-4232_fig01" src="https://pubs.usgs.gov/xml_test/Images/sac19-4232_fig01.png">
            </div>
        """

        expected_figure_string = """
            <figure>
                <a class="usa-link" id="fig01"></a>
                <h5>Figure 1</h5>
                <img alt=" Map showing location of pumping and observation wells, groundwater discharge area,
                    physiographic features, and groundwater basins surrounding the Ash Meadows groundwater
                    basin, Nevada and California." 
                    id="d5e647" 
                    src="https://pubs.usgs.gov/xml_test/Images/sac19-4232_fig01.png"/>
                <figcaption id="d5e645">
                    <b>Figure 1.</b> 
                    Location of pumping and observation wells, groundwater discharge area, physiographic
                    features, and groundwater basins surrounding the Ash Meadows groundwater basin, Nevada
                    and California.
                </figcaption>
            </figure>
        """

        soup = BeautifulSoup(sample_fig_panel_div, 'lxml')
        fig = soup.find('div', {"class": "fig panel"})

        expected_figure_string_no_whitespace = "".join(expected_figure_string.split())
        actual_figure_string_no_whitespace = "".join(str(get_figure(soup, fig)).split())

        self.assertEqual(expected_figure_string_no_whitespace, actual_figure_string_no_whitespace)


class GetTableTestCase(unittest.TestCase):
    """
    Tests for get_table
    """
    def test_does_the_transform_produce_usgs_styled_table(self):
        """Given a table, is a usgs styled table.usa-table generated?"""
        sample_table_string = """
            <table xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:mml="http://www.w3.org/1998/Math/MathML" xmlns:ali="http://www.niso.org/schemas/ali/1.0/" xmlns:xi="http://www.w3.org/2001/XInclude" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" rules="groups">
                <a id="d5e1943"><!-- named anchor --></a>
                <col width="20.65%" span="1">
                <a id="d5e1944"><!-- named anchor --></a>
                <col width="28.16%" span="1">
                <thead>
                    <a id="d5e1950"><!-- named anchor --></a>
                    <tr>
                        <a id="d5e1951">
                            <!-- named anchor -->
                        </a>
                        <td colspan="6" valign="top" align="center" scope="colgroup" style="border-top: solid 0.25pt; border-bottom: solid 0.25pt" rowspan="1">
                            <a id="d5e1952">
                                <!-- named anchor -->
                            </a>Observation wells—Drawdown estimated from depth-to-water measurements
                        </td>
                    </tr>
                </thead>
                <tbody>
                    <a id="d5e1955">
                        <!-- named anchor -->
                    </a>
                    <tr>
                        <a id="d5e1956">
                            <!-- named anchor -->
                        </a>
                        <td valign="top" align="left" style="border-top: solid 0.25pt" scope="row" rowspan="1" colspan="1">
                            <a id="d5e1957">
                                <!-- named anchor -->
                            </a><i>Army 1 WW (MV-1)</i><sup>1</sup></td>
                        <td valign="top" align="left" style="border-top: solid 0.25pt" rowspan="1" colspan="1">
                            <a id="d5e1962">
                                <!-- named anchor -->
                            </a>November 1, 2003–December 1, 2004
                        </td>
                    </tr>
                    <tr>
                        <a id="d5e1972">
                            <!-- named anchor -->
                        </a>
                        <td valign="top" align="left" scope="row" rowspan="1" colspan="1">
                            <a id="d5e1973">
                                <!-- named anchor -->
                            </a><i>U-3cn 5</i></td>
                        <td valign="top" align="left" rowspan="1" colspan="1">
                            <a id="d5e1976">
                                <!-- named anchor -->
                            </a>November 1, 2003–December 1, 2004
                        </td>
                    </tr>
                </tbody>
            </table>
        """

        expected_table_string = """
            <table class="usa-table" rules="groups" xmlns:ali="http://www.niso.org/schemas/ali/1.0/" xmlns:mml="http://www.w3.org/1998/Math/MathML" xmlns:xi="http://www.w3.org/2001/XInclude" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
                <a id="d5e1943"><!-- named anchor --></a>
                <col span="1" width="20.65%" />
                <a id="d5e1944"><!-- named anchor --></a>
                <col span="1" width="28.16%" />
                <thead>
                    <a id="d5e1950">
                        <!-- named anchor -->
                    </a>
                    <tr>
                        <a id="d5e1951">
                            <!-- named anchor -->
                        </a>
                        <td align="center" colspan="6" rowspan="1" scope="colgroup" style="border-top: solid 0.25pt; border-bottom: solid 0.25pt" valign="top">
                            <a id="d5e1952">
                                <!-- named anchor -->
                            </a>Observation wells—Drawdown estimated from depth-to-water measurements
                        </td>
                    </tr>
                </thead>
                <tbody>
                    <a id="d5e1955">
                        <!-- named anchor -->
                    </a>
                    <tr>
                        <a id="d5e1956">
                            <!-- named anchor -->
                        </a>
                        <td align="left" colspan="1" rowspan="1" scope="row" style="border-top: solid 0.25pt" valign="top">
                            <a id="d5e1957">
                                <!-- named anchor -->
                            </a><i>Army 1 WW (MV-1)</i><sup>1</sup></td>
                        <td align="left" colspan="1" rowspan="1" style="border-top: solid 0.25pt" valign="top">
                            <a id="d5e1962">
                                <!-- named anchor -->
                            </a>November 1, 2003–December 1, 2004
                        </td>
                    </tr>
                    <tr>
                        <a id="d5e1972">
                            <!-- named anchor -->
                        </a>
                        <td align="left" colspan="1" rowspan="1" scope="row" valign="top">
                            <a id="d5e1973">
                                <!-- named anchor -->
                            </a><i>U-3cn 5</i></td>
                        <td align="left" colspan="1" rowspan="1" valign="top">
                            <a id="d5e1976">
                                <!-- named anchor -->
                            </a>November 1, 2003–December 1, 2004
                        </td>
                    </tr>
                </tbody>
            </table>
        """

        soup = BeautifulSoup(sample_table_string, 'lxml')
        table = soup.find('table')

        expected_table_string_no_whitespace = "".join(expected_table_string.split())
        actual_table_string_no_whitespace = "".join(str(get_table(table)).split())

        self.assertEqual(expected_table_string_no_whitespace, actual_table_string_no_whitespace)


class GetListTestCase(unittest.TestCase):
    """
    Tests for get_list
    """
    def test_does_the_transform_produce_usgs_styled_list(self):
        """Given a div.list, is a usgs styled div.usa-list generated?"""
        sample_list_string = """
            <div class="list"><a id="L1">
                   <!-- named anchor --></a><ul style="list-style-type: none">
                   <li>
                      <p id="d5e1698"><span class="label">•</span> Water-level altitudes in wells;
                      </p>
                   </li>
                   <li>
                      <p id="d5e1703"><span class="label">•</span> Water-level differences between paired wells;
                      </p>
                   </li>
                </ul>
             </div>
        """

        expected_list_string = """
            <div class="usa-list">
                <a id="L1"><!-- named anchor --></a>
                <ul style="list-style-type: none">
                    <li>
                    <p id="d5e1698"><span class="label">•</span> Water-level altitudes in wells;</p>
                    </li>
                    <li>
                    <p id="d5e1703"><span class="label">•</span> Water-level differences between paired wells;</p>
                    </li>
                </ul>
            </div>
        """

        soup = BeautifulSoup(sample_list_string, 'lxml')
        div_list = soup.find('div', {'class': 'list'})

        expected_list_string_no_whitespace = "".join(expected_list_string.split())
        actual_list_string_no_whitespace = "".join(str(get_list(div_list)).split())

        self.assertEqual(expected_list_string_no_whitespace, actual_list_string_no_whitespace)


class GetSectionTitleTestCase(unittest.TestCase):
    """
    Tests for get_section_title
    """
    def test_does_transform_produce_pubs_styled_section_titles(self):
        """Given a section h3.title, is a pubs styled h3.series-title generated?"""
        sample_section_title_string = """
            <h3 class="section-title">Purpose and Scope</h3>
        """

        expected_section_title_string = """
            <h3 class="series-title">Purpose and Scope</h3>
        """

        soup = BeautifulSoup(sample_section_title_string, 'lxml')
        section_title = soup.find('h3', {'class': 'section-title'})

        expected_section_title_string_no_whitespace = "".join(expected_section_title_string.split())
        actual_section_title_string_no_whitespace = "".join(str(get_section_title(section_title)).split())

        self.assertEqual(expected_section_title_string_no_whitespace, actual_section_title_string_no_whitespace)


class GetTitleTestCase(unittest.TestCase):
    """
    Tests for get_title
    """
    def test_does_transform_produce_pubs_styled_titles(self):
        """Given an h3.title, is a pubs styled h3.subseries-title generated?"""
        sample_title_string = """
            <h3 class="title">
                Well location and construction information for pumping and observation wells monitored during 
                <i>ER-6-1-2 main</i> 
                development and aquifer testing, Ash Meadows groundwater basin, southern Nevada.
            </h3>
        """

        expected_title_string = """
            <h3 class="subseries-title">
                Well location and construction information for pumping and observation wells monitored during 
                <i>ER-6-1-2 main</i> 
                development and aquifer testing, Ash Meadows groundwater basin, southern Nevada.
            </h3>
        """

        soup = BeautifulSoup(sample_title_string, 'lxml')
        title = soup.find('h3', {'class': 'title'})

        expected_title_string_no_whitespace = "".join(expected_title_string.split())
        actual_title_string_no_whitespace = "".join(str(get_title(title)).split())

        self.assertEqual(expected_title_string_no_whitespace, actual_title_string_no_whitespace)


class GetATagTestCase(unittest.TestCase):
    """
    Tests for get_a_tag
    """
    def test_does_transform_produce_usgs_styled_links(self):
        """Given a link tag, is a usgs styled a.usa-link generated?"""
        sample_a_string = """
            <a href="#r1">Bechtel Nevada, 2004</a>
        """

        expected_a_string = """
            <a class="usa-link" href="#r1">Bechtel Nevada, 2004</a>
        """

        soup = BeautifulSoup(sample_a_string, 'lxml')
        a_tag = soup.find('a')

        expected_a_string_no_whitespace = "".join(expected_a_string.split())
        actual_a_string_no_whitespace = "".join(str(get_a_tag(a_tag)).split())

        self.assertEqual(expected_a_string_no_whitespace, actual_a_string_no_whitespace)


class GetMainTitleTestCase(unittest.TestCase):
    """
    Tests for get_main_title
    """
    def test_does_transform_produce_pubs_styled_main_title(self):
        """Given an h2.main-title, is a usgs styled h2.publication-title generated?"""
        sample_main_title_string = """
            <h2 class="main-title">Summary and Conclusions</h2>
        """

        expected_main_title_string = """
            <h2 class="publication-title">Summary and Conclusions</h2>
        """

        soup = BeautifulSoup(sample_main_title_string, 'lxml')
        main_title = soup.find('h2', {"class": "main-title"})

        expected_main_title_string_no_whitespace = "".join(expected_main_title_string.split())
        actual_main_title_string_no_whitespace = "".join(str(get_main_title(main_title)).split())

        self.assertEqual(expected_main_title_string_no_whitespace, actual_main_title_string_no_whitespace)
