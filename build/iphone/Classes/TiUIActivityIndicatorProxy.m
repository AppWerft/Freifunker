/**
 * Appcelerator Titanium Mobile
 * Copyright (c) 2009-2015 by Appcelerator, Inc. All Rights Reserved.
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 * 
 * WARNING: This is generated code. Modify at your own risk and without support.
 */
#ifdef USE_TI_UIACTIVITYINDICATOR

#import "TiUIActivityIndicatorProxy.h"
#import "TiUIActivityIndicator.h"

@implementation TiUIActivityIndicatorProxy

-(NSMutableDictionary*)langConversionTable
{
    return [NSMutableDictionary dictionaryWithObject:@"message" forKey:@"messageid"];
}

-(void)_initWithProperties:(NSDictionary*)properties
{
    [self initializeProperty:@"visible" defaultValue:NUMBOOL(NO)];
    [super _initWithProperties:properties];
}


-(NSString*)apiName
{
    return @"Ti.UI.ActivityIndicator";
}

-(TiDimension)defaultAutoWidthBehavior:(id)unused
{
    return TiDimensionAutoSize;
}
-(TiDimension)defaultAutoHeightBehavior:(id)unused
{
    return TiDimensionAutoSize;
}

USE_VIEW_FOR_CONTENT_WIDTH

USE_VIEW_FOR_CONTENT_HEIGHT

@end

#endif