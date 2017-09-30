/**
 * 例子
 */

const Li = ({ item }) => (
    <li>{item}</li>
);

export default ({ data }) => (
    <ul>
        { data.map(item => <Li item={item} />) }
    </ul>
);
