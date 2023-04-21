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
    const subComponentList = Object.keys(TCard);

    const subComponents = subComponentList.map((key) => {
        return React.Children.map(children, (child) => {
            const childType = child && child.type && (child.type.displayName || child.type.name);

            return childType.includes(key) ? child : null;
        });
    });

    return (
        <Card {...props} elevation={4} mode="elevated" style={[style, props.style]}>
            {subComponents.map((component) => component)}
        </Card>
    );
}

const Title = (props) => <Card.Title {...props} />;

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

TCard.Cover = Cover;

const Content = (props: any) => {
    const theme = useAppTheme();
    const style = {
        backgroundColor: theme.colors.grey6,
        borderBottomEndRadius: radius,
        borderBottomStartRadius: radius,
    };

    return <Card.Content {...props} style={[style, props.style]} />;
};

TCard.Content = Content;

const Action = (props) => <Card.Actions {...props} />;

TCard.Action = Action;

const Badge = (props: any) => {
    const style = { position: 'absolute', top: 8, left: 8, textAlign: 'center' };

    return <TBadge {...props} style={[style, props.style]} />;
};

TCard.Badge = Badge;

export default TCard;
