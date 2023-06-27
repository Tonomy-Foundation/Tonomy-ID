import React from 'react';
import { Card } from 'react-native-paper';
import TBadge from './atoms/TBadge';
import { commonStyles, useAppTheme } from '../utils/theme';

type TCardPropType = React.ComponentProps<typeof Card> & { style?: any };
const radius = 5;

function TCard({ children, ...props }: TCardPropType) {
    const theme = useAppTheme();
    const style = {
        borderWidth: 1,
        borderColor: theme.colors.grey5,
        borderRadius: radius,
    };

    const subComponents = React.Children.map(children, (child) => {
        return React.isValidElement(child) ? React.cloneElement(child) : child;
    });

    return (
        <Card {...props} elevation={4} mode="elevated" style={[style, props.style]}>
            {subComponents?.map((component) => component)}
        </Card>
    );
}

const Title = (props) => <Card.Title {...props} />;

Title.displayName = 'Title';
TCard.Title = Title;

const Cover = (props: any) => {
    const style = {
        width: 190,
        height: 130,
        borderTopEndRadius: radius,
        borderTopStartRadius: radius,
    };

    return <Card.Cover {...props} style={[style, props.style]} />;
};

Cover.displayName = 'Title';
TCard.Cover = Cover;

const Content = (props: any) => {
    const theme = useAppTheme();
    const style = {
        backgroundColor: theme.colors.grey4,
        borderBottomEndRadius: radius,
        borderBottomStartRadius: radius,
        paddingHorizontal: 8,
        paddingVertical: 5,
        borderTopWidth: 1,
        borderColor: theme.colors.grey5,
    };

    return <Card.Content {...props} style={[style, props.style]} />;
};

Content.displayName = 'Title';
TCard.Content = Content;

const Action = (props) => <Card.Actions {...props} />;

Action.displayName = 'Title';
TCard.Action = Action;

const Badge = (props: any) => {
    const style = { position: 'absolute', top: 8, left: 8, textAlign: 'center' };

    return <TBadge {...props} style={[style, props.style]} />;
};

Badge.displayName = 'Title';
TCard.Badge = Badge;

export default TCard;
