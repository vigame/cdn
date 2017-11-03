function OnCHException(e)
{
	}

GContentHub = {
	oApplicableSettings: {"main_cluster":{"top_sellers":true,"early_access":true,"games_already_in_library":true,"recommended_for_you":true,"prepurchase":true,"games":"always","software":true,"dlc_for_you":true,"dlc":null,"recently_viewed":null,"new_on_steam":null,"popular_new_releases":"always","games_not_in_library":null,"only_current_platform":true,"video":true,"localized":true,"virtual_reality":true,"recommended_by_curators":true,"hidden":null},"new_on_steam":{"top_sellers":null,"early_access":true,"games_already_in_library":true,"recommended_for_you":null,"prepurchase":null,"games":"always","software":true,"dlc_for_you":null,"dlc":null,"recently_viewed":null,"new_on_steam":null,"popular_new_releases":null,"games_not_in_library":null,"only_current_platform":true,"video":true,"localized":true,"virtual_reality":true,"recommended_by_curators":null,"hidden":null},"recently_updated":{"top_sellers":null,"early_access":true,"games_already_in_library":null,"recommended_for_you":null,"prepurchase":null,"games":"always","software":true,"dlc_for_you":null,"dlc":null,"recently_viewed":null,"new_on_steam":null,"popular_new_releases":null,"games_not_in_library":true,"only_current_platform":true,"video":true,"localized":true,"virtual_reality":true,"recommended_by_curators":null,"hidden":null},"tabs":null,"specials":null,"more_recommendations":null,"friend_recommendations":null,"curators":{"top_sellers":null,"early_access":true,"games_already_in_library":true,"recommended_for_you":null,"prepurchase":null,"games":"always","software":true,"dlc_for_you":null,"dlc":null,"recently_viewed":null,"new_on_steam":null,"popular_new_releases":null,"games_not_in_library":null,"only_current_platform":true,"video":true,"localized":true,"virtual_reality":true,"recommended_by_curators":null,"hidden":null},"home":{"top_sellers":null,"early_access":true,"games_already_in_library":null,"recommended_for_you":null,"prepurchase":true,"games":null,"software":true,"dlc_for_you":null,"dlc":null,"recently_viewed":null,"new_on_steam":null,"popular_new_releases":null,"games_not_in_library":null,"only_current_platform":null,"video":true,"localized":null,"virtual_reality":true,"recommended_by_curators":null,"hidden":null}},
	oDisplayLists: {},
	oSettings: {},
	strHubType: '',


	bUserDataReady: false,
	bStaticDataReady: false,
	bLoadedActiveData: false,

	rgUsedCapsules: {},

	usabilityTracker: null,

	InitLayout: function ( rgPageSections )
	{
		InitHorizontalAutoSliders ();
		$J.each(rgPageSections, function(i, j){
			GDynamicStore.OnReady( function(){
				GContentHub.InitPageSection(j);
			});

		});
	},

	AddCustomRender: function ( fnRender )
	{
		GContentHub.rgfnCustomRenders.push ( fnRender );
	},

	InitUserData: function ( rgParams )
	{
		try
		{
			GContentHub.oSettings = rgParams.oSettings || {};
			GContentHub.oFilters = rgParams.oFilters || {};

			if( typeof GContentHub.oFilters.all == "undefined" )
				GContentHub.oFilters.all = {};
			if( typeof GContentHub.oFilters.maincap == "undefined" )
				GContentHub.oFilters.maincap = {};


		} catch ( e )
		{
			OnCHException ( e );
		}

		GContentHub.bUserDataReady = true;
		if ( GContentHub.bStaticDataReady )
			GContentHub.OnHomeDataReady ();
	},

	InitStaticData: function ( rgParams )
	{
		try
		{
			GContentHub.oDisplayLists = rgParams;
		} catch ( e )
		{
			OnCHException ( e );
		}

		GContentHub.bStaticDataReady = true;
		if ( GContentHub.bUserDataReady )
			GContentHub.OnHomeDataReady ();
	},

	OnHomeDataReady: function ()
	{

		GDynamicStore.OnReady ( GContentHub.OnDynamicStoreReady );
	},

	OnDynamicStoreReady: function ()
	{
		var bHaveUser = ( g_AccountID != 0 );

		try
		{
			GContentHub.RenderMainCap();
		} catch ( e )
		{
			OnCHException ( e );
		}

		try
		{
			GContentHub.RenderRecommendedItems();

		} catch ( e )
		{
			OnCHException ( e );
		}

		try
		{

			GContentHub.RenderSpecials();
		} catch ( e )
		{
			OnCHException ( e );
		}

	},

	/**
	 * Builds a map of every capsule we've already rendered on the page, so we can avoid showing those twice.
	 * @constructor
	 */
	MarkSeenCapsules: function()
	{
		$J('*[data-ds-appid]').each(function(i, j){
			var nAppId = $J(j).data('dsAppid');
			this.rgUsedCapsules[ GContentHub.ItemKey( { 'appid': nAppId } ) ] = true;
		}.bind(this) );

		$J('*[data-ds-packageid]').each(function(i, j){
			var nPackageId = $J(j).data('dsPackageid');
			this.rgUsedCapsules[ GContentHub.ItemKey( { 'packageid': nPackageId } ) ] = true;
		}.bind(this) );

	},

	MarkSeenCapsule: function( rgItem )
	{
		GContentHub.rgUsedCapsules[ GContentHub.ItemKey(rgItem) ] = true;
	},

	FilterSeenCapsules: function( rgCapsules )
	{
		return rgCapsules.filter( function( cap ){

			if( this.rgUsedCapsules[ GContentHub.ItemKey( cap ) ] )
				return false;
			return true;

		}.bind(this) );
	},

	RenderSpecials: function()
	{
		var rgDisplayList = GContentHub.FilterItemsForDisplay(
			GContentHub.oDisplayLists.specials, 'home', 12, 12, $J.extend(GContentHub.oFilters.all, GContentHub.oSettings, { games_already_in_library: false, localized: true, displayed_elsewhere: false, only_current_platform: true } )
		);

		var elTarget = $J('#specials_container .contenthub_specials_grid');

		$J.each( rgDisplayList, function( i, j ) {
			var elContainer = $J('<div class="contenthub_specials_grid_cell"></div>');
			GContentHub.MarkSeenCapsule( j );
			elContainer.append( GDynamicStoreHelpers.BuildCapsuleHTML( 'specials', j.appid, j.packageid, j.bundleid, { 'capsule_size': 'header' }  )  );
			elTarget.prepend(elContainer);

		});


	},

	RenderRecommendedItems: function()
	{
		return;// noop

		var rgDisplayList = GContentHub.FilterItemsForDisplay(
			GContentHub.oDisplayLists.recommended, 'home', 4, 12, $J.extend(GContentHub.oFilters.all, GContentHub.oSettings, { games_already_in_library: false, localized: true, displayed_elsewhere: true, only_current_platform: true } )
		);

		var rgOptions = { 'capsule_size': 'header' };

		GDynamicStoreHelpers.FillPagedCapsuleCarousel( rgDisplayList, $J('.featured_items'), function( oItem, strFeature, rgOptions ) {
			return GDynamicStoreHelpers.BuildCapsuleHTML(strFeature, oItem.appid, oItem.packageid, oItem.bundleid, rgOptions);
		} , 'recommended', 4, rgOptions );

	},


	InitPageSection: function( rgSectionInfo )
	{
		var $sectionContainer = $J('#page_section_container');

		var strTemplate = "<div class=\"page_content_ctn \" >\r\n\t\t\t\t<div class=\"page_content \" >\r\n\r\n\t\t\t\t\t<div class=\"carousel_container paging_capsules featured_items\">\r\n\t\t\t\t\t\t<h2>%1$s\r\n\t\t\t\t\t\t\t<span class=\"header_inline\">%2$s<\/span>\r\n\t\t\t\t\t\t<\/h2>\r\n\r\n\t\t\t\t\t\t<div class=\"carousel_items store_capsule_container\"><\/div>\r\n\t\t\t\t\t\t<div class=\"carousel_thumbs\"><\/div>\r\n\t\t\t\t\t\t<div class=\"arrow left\"><div><\/div><\/div>\r\n\t\t\t\t\t\t<div class=\"arrow right\"><div><\/div><\/div>\r\n\t\t\t\t\t<\/div>\r\n\t\t\t\t<\/div>\r\n\t\t\t<\/div>".replace(/%1\$s/, rgSectionInfo.title).replace(/%2\$s/, rgSectionInfo.description);

		var $section = $J(strTemplate);
		$sectionContainer.append($section);

		var rgDisplayList = GContentHub.FilterItemsForDisplay(
			GContentHub.oDisplayLists[ rgSectionInfo.id ], 'home', 4, 12, $J.extend(GContentHub.oFilters.all, GContentHub.oSettings, { games_already_in_library: false, localized: true, displayed_elsewhere: true, only_current_platform: true } )
		);

		var rgOptions = { 'capsule_size': 'header' };

		GDynamicStoreHelpers.FillPagedCapsuleCarousel( rgDisplayList, $J('.featured_items', $section), function( oItem, strFeature, rgOptions ) {
			return GDynamicStoreHelpers.BuildCapsuleHTML(strFeature, oItem.appid, oItem.packageid, oItem.bundleid, rgOptions);
		} , rgSectionInfo.id, 4, rgOptions );

	},

	RenderMainCap: function()
	{
		// Build a pool of things to show

		var rgDisplayListCombined = GContentHub.ZipLists(
			//this.FilterSeenCapsules( GContentHub.oDisplayLists.popular_new_releases ), true,
			this.FilterSeenCapsules( GContentHub.oDisplayLists.top_sellers ), true, // Top new releases
			this.FilterSeenCapsules( GContentHub.oDisplayLists.specials ) , true,
			this.FilterSeenCapsules( GContentHub.oDisplayLists.concurrent ), true
		);
		rgDisplayListCombined = GContentHub.MergeLists(GContentHub.oDisplayLists.featured, false, rgDisplayListCombined, true);
		// Filter out bundles
		var rgDisplayListCombinedNoBundles = [];
		$J.each(rgDisplayListCombined , function(i, j){
			if( !j.bundleid )
				rgDisplayListCombinedNoBundles.push(j);
		});

		rgDisplayListCombined = GContentHub.FilterItemsForDisplay(
			rgDisplayListCombinedNoBundles, 'home', 6, 15, $J.extend(GContentHub.oFilters.all, GContentHub.oFilters.maincap, GContentHub.oSettings, { games_already_in_library: false, localized: true, only_current_platform: true} )
		);

		populate_genre_large_cluster( rgDisplayListCombined, this.GetRecommendationReason.bind(this) );
	},

	GetRecommendationReason: function( oItem )
	{
		var curator = GDynamicStore.GetCuratorForApp( oItem.appid );
		if( curator )
		{
			return {
				reason: 'curator',
				curator: curator
			};
		}

		var rgItemData = GStoreItemData.GetCapParams( '', oItem.appid, oItem.packageid, oItem.bundleid, {});

		// See if we have a high tag overlap
		var rgMatchedTags = [];


		if ( rgItemData && rgItemData.tags )
		{
			for ( var i = 0; i < GDynamicStore.s_rgRecommendedTags.length && rgMatchedTags.length <= 3; i++ )
			{
				if ( rgItemData.tags.indexOf ( GDynamicStore.s_rgRecommendedTags[ i ].name ) !== -1 )
					rgMatchedTags.push ( '<span>' + GDynamicStore.s_rgRecommendedTags[ i ].name + '</span>' );
			}

			if( rgMatchedTags.length >= 3 )
			{
				return {
					reason: 'tags',
					tags: rgMatchedTags
				}
			}
		}

		var reason = false;


		$J.each({
			'top_seller' : GContentHub.oDisplayLists.top_sellers,
			'popular_new': GContentHub.oDisplayLists.popular_new_releases,
			'specials': GContentHub.oDisplayLists.specials,
			'concurrent': GContentHub.oDisplayLists.concurrent,
			'featured' : GContentHub.oDisplayLists.featured
		},function(strDisplayList, rgItems){
			for( var i=0; i<rgItems.length; i++)
			{
				if( reason )
					return;
				if( oItem.appid && oItem.appid == rgItems[i].appid )
					reason = { reason: strDisplayList };
				else if( oItem.packageid && oItem.packageid == rgItems[i].packageid )
					reason = { reason: strDisplayList };
				else if( oItem.bundleid && oItem.bundleid == rgItems[i].bundleid )
					reason = { reason: strDisplayList };
			}
		});

		return reason;
	},

	CheckLocalStorageSettings: function()
	{
		// to defeat bfcache
		var oSettings = WebStorage.GetLocal( 'home_viewsettings', true );
		if ( oSettings )
			GContentHub.oSettings = oSettings;
	},

	ZipLists: function( /* rgList1, bShuffle1, rgList2, bShuffleList2, rgList3, bShuffleList3, etc... */ )
	{
		return GContentHub.MergeListsInternal( arguments, true );
	},

	MergeLists: function( /* rgList1, bShuffle1, rgList2, bShuffleList2, rgList3, bShuffleList3, etc... */ )
	{
		return GContentHub.MergeListsInternal( arguments, false );
	},

	MergeListsInternal: function( args, bZip )
	{
		var rgLists = [];
		for ( var iArg = 0; iArg < args.length; iArg++ )
		{
			var rgList = args[iArg] || [];
			if ( iArg + 1 < args.length && args[++iArg] )
				rgList = v_shuffle( rgList );
			rgLists.push( rgList );
		}

		var oIncludedItems = {};
		var rgOutput = [];

		var fnAddItem = function( rgItem ) {
			var key = GContentHub.ItemKey( rgItem );
			if ( !oIncludedItems[key] )
			{
				oIncludedItems[key] = true;
				rgOutput.push( rgItem );
				return true;
			}
			return false;
		};

		if ( bZip )
		{
			var rgIndicies = [];
			while( rgIndicies.length < rgLists.length )
				rgIndicies.push( 0 );

			var bRemaining = true;
			while ( bRemaining )
			{
				bRemaining = false;
				for( var iList = 0; iList < rgLists.length; iList++ )
				{
					var rgList = rgLists[iList];
					var i = rgIndicies[iList];
					if ( i >= rgList.length )
						continue;

					// keep trying to add until one sticks
					while( i < rgList.length && !fnAddItem( rgList[i++] ) )
						;
					rgIndicies[iList] = i;
					bRemaining = true;
				}
			}
		}
		else
		{
			for ( var iList = 0; iList < rgLists.length; iList++ )
			{
				var rgList = rgLists[iList];
				for ( var i = 0; i < rgList.length; i++ )
					fnAddItem( rgList[i] );
			}
		}

		return rgOutput;
	},

	ItemKey: function( rgItem )
	{
		if( rgItem.appid )
			return 'a' + rgItem.appid;
		if( rgItem.packageid )
			return 'p' + rgItem.packageid;
		if( rgItem.bundleid )
			return 'b' + rgItem.bundleid;
	},

	FilterItemsForDisplay: function( rgItems, strSettingsName, cMinItemsToDisplay, cMaxItemsToDisplay, rgAdditionalSettings )
	{

		var Settings = GContentHub.oSettings[strSettingsName] || {};
		var ApplicableSettings = GContentHub.oApplicableSettings[strSettingsName] || {};

		// Allow sections to have additional, section-specific settings. We'll use jQuery to shallow copy the settings
		// object so we don't pollute future calls.
		if( rgAdditionalSettings )
		{
			Settings = jQuery.extend({}, Settings, rgAdditionalSettings);

			// Ensure our feature is turned on as an applicable setting
			for( var strKey in rgAdditionalSettings )
				rgAdditionalSettings[strKey] = true;

			ApplicableSettings = jQuery.extend({}, ApplicableSettings, rgAdditionalSettings);

		}

		if ( GContentHub.bHideAdultContentViolence )
			Settings = jQuery.extend({}, Settings, {hide_adult_content_violence: true});

		if ( GContentHub.bHideAdultContentSex )
			Settings = jQuery.extend({}, Settings, {hide_adult_content_sex: true});

		if ( !cMaxItemsToDisplay )
			cMaxItemsToDisplay = cMinItemsToDisplay;

		return GStoreItemData.FilterItemsForDisplay( rgItems, Settings, ApplicableSettings, cMaxItemsToDisplay, cMinItemsToDisplay )
	}

};

var g_rgPagingControls = {};
function InitHubTabControls( rgPagingData, cc, hide_adult_content_violence, hide_adult_content_sex )
{
	var g_rgTabs = {};
	var g_rgTabBaseParams = {
		cc: cc,
		l: 'english',
		no_violence:hide_adult_content_violence,
		no_sex:hide_adult_content_sex,
		v: "4"
	};
	var g_rgTabParams = {};
	var g_strActiveTab = null;
	var rgTabNames = [ 'NewReleases', 'TopSellers', 'ConcurrentUsers', 'ComingSoon' ];

	for ( var pg = 0; pg < rgPagingData.length; ++pg )
	{
		var oPagingData = rgPagingData[pg];

		// don't try to add paging for a tab that has no items in it because the tab is probably hidden
		if ( oPagingData.total_count > 0 )
		{
			var oPagingControls = new CAjaxPagingControls( oPagingData, oPagingData[ 'url' ] );
			oPagingControls.m_rgStaticParams = g_rgTabBaseParams;

			oPagingControls.SetResponseHandler( function ( response )
			{
				fnOnRendered();
				$J( '#' + this.m_strElementPrefix + 'Rows' ).InstrumentLinks();
			} );
			oPagingControls.SetPageChangingHandler( function ( nPage )
			{
				$J( '#' + this.m_strElementPrefix + 'Rows' ).fadeTo( 0.1, 0.5 );
			} );
			oPagingControls.SetPageChangedHandler( function ( nPage )
			{
				UpdateQueryString();
				$J( '#' + this.m_strElementPrefix + 'Rows' ).fadeTo( 0.1, 1 );
			} );

			g_rgPagingControls[ oPagingData[ 'prefix' ] ] = oPagingControls;
			rgTabNames.push( oPagingData[ 'prefix' ] );
		}
	}

	function fnOnRendered()
	{
		var bHaveUser = ( g_AccountID != 0 );
		if ( !bHaveUser )
		{
			return;
		}

		GDynamicStore.DecorateDynamicItems();
	}

	var InitTabEvents = function( Tab )
	{
		Tab.m_$Select.click( function() {
			UpdateTabDisplay( Tab.m_strName );
			UpdateQueryString();
		} );
	};

	var UpdateTabDisplay = function( strActiveTab )
	{
		if ( !strActiveTab )
			strActiveTab = g_strActiveTab;
		else
			g_strActiveTab = strActiveTab;

		for ( var strTabName in g_rgTabs )
		{
			var Tab = g_rgTabs[strTabName];
			if ( strTabName == strActiveTab )
			{
				Tab.m_$Select.addClass( 'active' );
				Tab.m_$Content.show();
				if ( Tab.m_nLoaded == 0 )
				{
					LoadTab( Tab );
				}
			}
			else
			{
				Tab.m_$Select.removeClass( 'active' );
				Tab.m_$Content.hide();
			}
		}
	};

	var UpdateQueryString = function() {

		var rgQuery = {};
		if ( g_rgPagingControls[g_strActiveTab] )
			rgQuery['p'] = g_rgPagingControls[g_strActiveTab].m_iCurrentPage;

		rgQuery['tab'] = g_strActiveTab;
		window.location.hash = $J.param( rgQuery );
	};

	var LoadFromQueryString = function() {

		var strQuery = window.location.hash.substr(1);
		var rgQuery = strQuery.toQueryParams();

		// need to find the active tab, before we switch pages
		$J.each(rgQuery, function(param)
		{
			if( param == 'tab')
			{
				g_strActiveTab = rgQuery[param];
				return true;
			}
		});

		// so take these in order
		$J.each(rgQuery, function(param)
		{
			if ( param == 'p' )
			{
				// switch to the page passed in
				HandleHashChange( rgQuery[param] );
			}
		});

		UpdateTabDisplay();
	};

	var LoadTab = function( Tab )
	{
		var rgParams = $J.extend( {
		}, g_rgTabBaseParams );

		for ( var filter in g_rgTabParams )
		{
			var rgParamValues = g_rgTabParams[filter];
			if ( rgParamValues && rgParamValues.length )
			{
				rgParamValues.sort();
				for ( var i = 0; i < rgParamValues.length; i++ )
				{
					rgParams[ filter + '[' + i + ']' ] = rgParamValues[i].toString();
				}
			}
		}

		UpdateQueryString();
	};

	function HandleHashChange( nPage )
	{
		if ( g_rgPagingControls[g_strActiveTab] && nPage != g_rgPagingControls[g_strActiveTab].m_iCurrentPage )
		{
			g_rgPagingControls[g_strActiveTab].GoToPage( nPage , false );
		}
	}

	// perform initialization
	for ( var i = 0 ; i < rgTabNames.length; i++ )
	{
		var strName = rgTabNames[i];
		var Tab = {
			m_strName: strName,
			m_$Select: $J('#tab_select_' + strName ),
			m_$Content: $J('#tab_' + strName + '_content' )
		};

		InitTabEvents( Tab );

		g_rgTabs[ strName ] = Tab;
	}

	UpdateTabDisplay( rgTabNames[0] );
	LoadFromQueryString();
}