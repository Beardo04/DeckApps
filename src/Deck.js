import React, {Component} from 'react';
import {View, Animated, PanResponder,Dimensions,LayoutAnimation,UIManager} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 0.25*SCREEN_WIDTH;
const SWIPE_OUT_DURATION = 250

class Deck extends Component{
    static defaultProps={
        onSwipeRight:()=>{},
        onSwipeLeft:()=>{},
        renderNoMoreCards:()=>{}
    }
    
    constructor(props){
        super(props);
        
        const position= new Animated.ValueXY();
        
        const panResponder = new PanResponder.create({
            onStartShouldSetPanResponder:()=>true,
            onPanResponderMove:(event,gesture)=>{
                position.setValue({x:gesture.dx,y:0});
            },
            onPanResponderRelease:(event,gesture)=>{
                if(gesture.dx>SWIPE_THRESHOLD){
                    this.forceSwipe(true);
                }else if(gesture.dx< -SWIPE_THRESHOLD){
                     this.forceSwipe(false);        
                }else{
                    this.resetPosition();
                }
            }
        });
        
        this.state = {panResponder,position,index:0};
    }

    componentWillUpdate(){
        UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
        LayoutAnimation.spring();
    }
    
    getCardStyle(){
        const {position} = this.state;
        const rotate=position.x.interpolate({
            inputRange:[-SCREEN_WIDTH*2,0,SCREEN_WIDTH*2],
            outputRange: ['-120deg','0deg','120deg']
        });
        
        return {
            ...position.getLayout(),
            transform:[{rotate:rotate}]
        };
    }

    resetPosition(){
        Animated.spring(this.state.position,{
           toValue:{x:0,y:0} 
        }).start();
    }

    forceSwipe(direction){
        const x = direction?SCREEN_WIDTH:-SCREEN_WIDTH;
        Animated.timing(this.state.position,{
            toValue:{x:x*2,y:0},
            duration:SWIPE_OUT_DURATION
        }).start(()=>this.onSwipeComplete(direction));
    }

    onSwipeComplete(direction){
        const {onSwipeLeft,onSwipeRight,data} = this.props;
        const item = data[this.state.index];
        
        direction ? onSwipeRight(item) : onSwipeLeft(item);
        this.state.position.setValue({x:0,y:0});
        this.setState({index:this.state.index+1});
    }
    
    renderCards(){
        if(this.state.index>=this.props.data.length){
            return this.props.renderNoMoreCards();
        }
        
        return this.props.data.map((item,index)=>{
            if(index<this.state.index){return null;}
            if(index===this.state.index){
                 return(
                    <Animated.View
                        key={item.id}
                        style={[this.getCardStyle(),styles.cardStyle]}
                        {...this.state.panResponder.panHandlers}>
                            {this.props.renderCard(item)}
                    </Animated.View>
            );
            }
            return (
                <Animated.View
                    style={[styles.cardStyle,{ top: 10*(index-this.state.index) }]}
                    key={item.id}>
                    {this.props.renderCard(item)}
                </Animated.View>
            );
        }).reverse();
    }
    
    render(){
        return(
            <View>
                {this.renderCards()}
            </View>
        );
    }
}

const styles={
    cardStyle:{
        position:'absolute',
        width:SCREEN_WIDTH,
        elevation:100
        
    }
};

export default Deck;