
India's World Trade - A Visual Overview Of The Last Decade
=============================================

## The Goal

In this narrative visualisation I have visualised India’s trade (export/import) with the rest of the world for the past 10 years. This visualisation aims to achieve three goals:

1.  To throw light on the export/import balance across countries.
2.  To provide an insight into export/import trend for the past decade.    
3.  To let the user explore the dataset across countries, commodities and years.
    
To achieve these goals, I have used a Martini Glass hybrid structure. This structure will allow me to present some key insights at the start and then let the user explore the vast dataset across three dimensions.

  

## Dataset

This dataset is a subset of the import/export data available at the official website of the Ministry of Commerce and Industry (Government of India): [http://commerce-app.gov.in/eidb/default.asp](http://commerce-app.gov.in/eidb/default.asp). The site provides data for every commodity imported and exported by India from every country in the world.

I prepared this dataset as follows:

* For the financial years 2008-09 to 2017-18, I downloaded the dataset for every commodity imported/exported by India for each country. The data was downloaded using an R script. The dataset of each country contained the following columns:
	*   Commodity Name    
	*   Import value in million $
	*   Export value in million $

* I used an R script to stitch together the data for each country into a single dataset, which had the following columns:

	*   Country
	*   Commodity Name
	*   Import value in million $
	*   Export value in million $
	*   The above dataset formed my main ‘Data Cube’
    
I used additional R scripts to query and summarise the 'Data Cube' for various graphs of the narrative visualisation. This was done to make sure the graphs load as fast as possible.

  

## Scenes

The visualisation has a total of five scenes:

1.  \[Choropleth\] Trade Balance with respect to each country    
2.  \[Line chart\] Annual Export/Import trend    
3.  \[Area Chart\] Annual Export/Import trend, split by country    
4.  \[Area Chart\] Annual Export/Import trend, split by commodity    
5.  \[Line Chart\] Annual Export/Import trend, by country and commodity
    

The scenes appear in a linear order by simply scrolling the window. The height of each scene is adjusted such that the user can view almost one complete scene at a time.  

Since it was about India's world trade, I saw it fitting to have a world map (implemented as a choropleth) as my first scene. More information about this chart is provided at the end of this document. This first scene differs drastically from the rest of the scenes, which are all time trends over a decade. This was intentional as I wanted to

*   first provide a high level summary of the entire decade before diving into the annual time trends.    
*   make sure proper visual context of the world is set in the mind of the user. In other words, I wanted to make sure countries are not just names.
    

  

The scenes that come after the first one have a similar layout and structure:

*   Y axis is trade volume (continuous)   
*   X axis is year (continuous)
*   The legend is on the right hand side
*   Tooltips for detail on demand
    
This ensures that the transition is as smooth as possible between the scenes.

The last scene is a special one, which allows the user to visualise an import and export time trend for any combination of country and commodity. This scene is where the user can explore the entire dataset on which this visualisation is based.

## Annotations

Annotations have been provided in two ways:

*   Brief text on top of each chart
*   Text annotations within the chart
    
The text annotations within the choropleth (scene #1) have been used to indicate countries from which India mostly only imports.

The text annotations within the annual import/export trend chart (scene #2) have been provided to give some context of the various important events that occurred in the last decade and that may have impacted India's global trade.

The rest of the scenes don't have text annotations within the chart. Also, the annotation are never cleared from the charts.

  
## Parameters

The narrative visualisation has following parameters:

### Trade Type

This parameter is present on the following scenes:

*   \[Scene #3\] \[Area Chart\] Annual Export/Import trend, split by country    
*   \[Scene #4\] \[Area Chart\] Annual Export/Import trend, split by commodity
    
Possible Values

*   Export
*   Import
    

The parameters allows the user to switch between a stacked area chart of export values and import values.
(Note that the said parameter on each of the above scenes is independent of each other. )

  

### Country and Commodity

These parameters are present only in the following scene:

\[Scene #5 \]\[Line Chart\] Annual Export/Import trend, by country and commodity

  

Possible values of country parameters: A list of all countries in the dataset

Possible values of commodity parameters: A list of all commodities in the dataset

  

These parameters together allow the user to view an annual trend of export & import values for any combination of country and commodity.

  

### Scroll Offset

This is an implicit parameter which tiggers initialisation animations on the following scenes:

*   \[Scene #2 \]\[Line chart\] Annual Export/Import trend
*   \[Scene #3 \]\[Area Chart\] Annual Export/Import trend, split by country 
*   \[Scene #4 \]\[Area Chart\] Annual Export/Import trend, split by commodity
    
When a user scrolls to one of the above scenes, for the first time, the scenes are rendered in an animated way.

  

## Triggers

The narrative visualisation utilises the following triggers.

### Page Load

*   The choropleth (scene #1) is rendered when the page loads. This also involves a CSV data fetch in the background    
*   Additionally, the exploration scene (scene #5) is also rendered in the background. This also involves a CSV data fetch in the background
    

  

### On Change of Trade Type Selector (Scene #3/#4)

*   This triggers the update of the respective chart with stacked area chart of either export values or import values.
    

### On Change of Country Selector (Scene #5)

*   Triggers the update of the scene #5 chart.
*   The trigger passed the current value of the 'Country' and 'Commodity' parameter
    
### On Change of Commodity Selector (Scene #5)

*   Triggers the update of the scene #5 chart.
*   The trigger passed the current value of the 'Country' and 'Commodity' parameter
    

### Scroll to Scene #2 / #3 / #4

*   Triggered when a user scrolls to scene #2, #3 or #4    
*   Triggers the rendering of the respective chart.
*   Rendering happens exactly once, till the page is reloaded.
    


* * *

**A Note About The Balance of Trade Chart (Scene #1)**

The aim of the chart is to indicate India’s balance of trade - export vs import - with respect to each country in the world. To do that I created new computed field called ‘import\_vs\_export’, which is derived for each country as follows:

import\_vs\_export = ((export/(export + import)) - 0.5)\*2

Here are some properties of the ‘import\_vs\_export' field, with respect to each country:

*   import\_vs\_export is -1 if India only imports from this country    
*   import\_vs\_export is 0 if India imports/exports equally from this country.    
*   import\_vs\_export is -1 if India only exports to this country.
    
(Note that above properties are just indicative - import\_vs\_export is a continuous field and can have any number between -1 and 1. )

I then mapped a diverging colour scale, red-yellow-green, to the ‘import\_vs\_export’ field to provide a visual idea of the trade balance with each country. Thus, if the colour of the country is a dark green, we can infer that India mostly exports to that country and if it is dark red, India mostly imports from that country. And if a country has a yellow hue, it indicates that there is a balance of trade with that country. For example, we can observe that India exports more stuff to the US than it imports from the US.

I chose a map as a glyph to highlight that India trades with almost all regions of the world. Additionally, it is interesting to note that even within the same continent, the import/export balance varies a lot across countries.

  

To make this chart more useful and informative, the tooltip of each country also provides the following information:

*   Total import value (million $)   
*   Total export value (million $)
    
Of course, since this chart focuses on the balance of trade, it does not provide any insight into the actual magnitude of the trade.
